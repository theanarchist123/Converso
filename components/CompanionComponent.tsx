'use client';

import { useEffect, useRef, useState } from 'react'
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json'
import { saveSessionTranscript, addToSessionHistory } from "@/lib/actions/companion.actions";
import type { SavedMessage } from '@/types/messages';

interface CompanionComponentProps {
    companionId: string;
    subject: string;
    topic: string;
    name: string;
    userName: string;
    userImage: string;
    style: string;
    voice: string;
}

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

const CompanionComponent = ({ companionId, subject, topic, name, userName, userImage, style, voice }: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // Add a useEffect to monitor callStatus changes
    useEffect(() => {
        console.log('CallStatus changed to:', callStatus);
    }, [callStatus]);

    useEffect(() => {
        if(lottieRef) {
            if(isSpeaking) {
                lottieRef.current?.play()
            } else {
                lottieRef.current?.stop()
            }
        }    }, [isSpeaking, lottieRef]);

    useEffect(() => {
        const onCallStart = () => {
            console.log('Call started');
            setCallStatus(CallStatus.ACTIVE);
        };

        const onCallEnd = async () => {
            console.log('Call ended');
            setCallStatus(CallStatus.FINISHED);
            await addToSessionHistory(companionId);
            if (messages.length > 0) {
                try {
                    await saveSessionTranscript(companionId, messages);
                    console.log('Session transcript saved successfully');
                } catch (error) {
                    console.error('Failed to save session transcript:', error);
                }
            }
        }

        const onMessage = (message: { type: string; transcriptType: string; role: string; transcript: string }) => {
            console.log('Received message:', message);
            if (message.type === 'transcript') {
                console.log('Transcript message received:', message);
                if (message.transcriptType === 'final') {
                    console.log('Final transcript received:', message.transcript);
                    const newMessage: SavedMessage = {
                        role: message.role === 'assistant' ? 'assistant' : 'user',
                        content: message.transcript
                    };
                    console.log('Adding new message:', newMessage);
                    setMessages(prevMessages => {
                        console.log('Previous messages:', prevMessages);
                        return [newMessage, ...prevMessages];
                    });
                }
            }
        }

        const onSpeechStart = () => {
            console.log('Speech started');
            setIsSpeaking(true);
        };
        
        const onSpeechEnd = () => {
            console.log('Speech ended');
            setIsSpeaking(false);
        };

        const onError = (error: Error) => {
            console.error('VAPI Error:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // Check if the error is related to meeting ejection
            if (error.message && error.message.includes('Meeting ended due to ejection')) {
                console.log('Meeting ended normally, handling gracefully');
                // Force the status to FINISHED to enable the repeat button
                setCallStatus(CallStatus.FINISHED);
                console.log('Set status to FINISHED after ejection');
                
                // Save session data if there are messages
                if (messages.length > 0) {
                    saveSessionTranscript(companionId, messages)
                        .then(() => console.log('Session transcript saved after ejection'))
                        .catch(err => console.error('Failed to save transcript after ejection:', err));
                    
                    addToSessionHistory(companionId)
                        .catch(err => console.error('Failed to add to session history after ejection:', err));
                }
            } else {
                // Handle other errors by resetting to inactive state
                console.log('Setting status to INACTIVE due to non-ejection error');
                setCallStatus(CallStatus.INACTIVE);
            }
        };        // Register event handlers
        console.log('Setting up VAPI event handlers');
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('error', onError);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);

        return () => {
            console.log('Cleaning up VAPI event handlers');
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('error', onError);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
        }
    }, [companionId, messages, setMessages, setCallStatus, setIsSpeaking]);

    const toggleMicrophone = () => {
        const isMuted = vapi.isMuted();
        vapi.setMuted(!isMuted);
        setIsMuted(!isMuted)
    }

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        setMessages([]); // Clear previous messages when starting new call

        const assistantOverrides = {
            variableValues: { subject, topic, style }
        }

        try {
            await vapi.start(configureAssistant(voice, style), assistantOverrides);
        } catch (error) {
            console.error('Failed to start VAPI:', error);
            setCallStatus(CallStatus.INACTIVE);
        }
    }

    const handleDisconnect = () => {
        console.log('handleDisconnect called, stopping VAPI session');
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
        console.log('VAPI session stopped, status set to FINISHED');
    }

    const handleRepeat = async () => {
        console.log('handleRepeat called, current status:', callStatus);
        
        // Stop the current session regardless of its status
        console.log('Stopping any active session before restart');
        vapi.stop();
        
        // Then start a new session
        console.log('Setting status to CONNECTING and clearing messages');
        setCallStatus(CallStatus.CONNECTING);
        setMessages([]); // Clear previous messages
        
        const assistantOverrides = {
            variableValues: { subject, topic, style }
        };
        
        try {
            console.log('Starting new VAPI session with:', { voice, style, subject, topic });
            await vapi.start(configureAssistant(voice, style), assistantOverrides);
            console.log('VAPI session started successfully');
        } catch (error) {
            console.error('Failed to restart VAPI:', error);
            // Show more detailed error information
            if (error instanceof Error) {
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            setCallStatus(CallStatus.INACTIVE);
        }
    }

    return (
        <section className="flex flex-col h-[70vh]">
            <section className="flex gap-8 max-sm:flex-col">
                <div className="companion-section">
                    <div className="companion-avatar" style={{ backgroundColor: getSubjectColor(subject)}}>
                        <div
                            className={
                                cn(
                                    'absolute transition-opacity duration-1000', 
                                    callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE ? 'opacity-100' : 'opacity-0', 
                                    callStatus === CallStatus.CONNECTING && 'opacity-100 animate-pulse'
                                )
                            }>
                            <Image src={`/icons/${subject}.svg`} alt={subject} width={150} height={150} className="max-sm:w-fit" />
                        </div>

                        <div className={cn('absolute transition-opacity duration-1000', callStatus === CallStatus.ACTIVE ? 'opacity-100': 'opacity-0')}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                autoplay={false}
                                className="companion-lottie"
                            />
                        </div>
                    </div>
                    <p className="font-bold text-2xl">{name}</p>
                </div>

                <div className="user-section">
                    <div className="user-avatar">
                        <Image src={userImage} alt={userName} width={130} height={130} className="rounded-lg" />
                        <p className="font-bold text-2xl">
                            {userName}
                        </p>
                    </div>
                    <div className="flex gap-2 w-full">
                        <button className="btn-mic flex-1" onClick={toggleMicrophone} disabled={callStatus !== CallStatus.ACTIVE}>
                            <Image src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'} alt="mic" width={36} height={36} />
                            <p className="max-sm:hidden">
                                {isMuted ? 'Turn on mic' : 'Turn off mic'}
                            </p>
                        </button>
                        <button 
                            className="btn-mic flex-1" 
                            onClick={() => {
                                console.log('Repeat button clicked, current status:', callStatus);
                                handleRepeat();
                            }}
                        >
                            <Image src="/icons/repeat.svg" alt="repeat" width={36} height={36} />
                            <p className="max-sm:hidden">Repeat</p>
                        </button>
                    </div>
                    <button 
                        className={cn(
                            'rounded-lg py-2 cursor-pointer transition-colors w-full text-white', 
                            callStatus === CallStatus.ACTIVE ? 'bg-red-700' : 'bg-primary', 
                            callStatus === CallStatus.CONNECTING && 'animate-pulse'
                        )} 
                        onClick={() => {
                            console.log('Session button clicked, current status:', callStatus);
                            if (callStatus === CallStatus.ACTIVE) {
                                handleDisconnect();
                            } else {
                                handleCall();
                            }
                        }}
                    >
                        {callStatus === CallStatus.ACTIVE
                            ? "End Session"
                            : callStatus === CallStatus.CONNECTING
                                ? 'Connecting'
                                : 'Start Session'
                        }
                    </button>
                </div>
            </section>            <section className="transcript mt-8 flex-1 min-h-[200px] relative">
                <div className="transcript-message no-scrollbar h-full">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-500">No messages yet. Start speaking to see the transcript.</p>
                    ) : (
                        messages.map((message, index) => {
                            const displayName = message.role === 'assistant' 
                                ? name.split(' ')[0].replace(/[.,]/g, '')
                                : userName || 'You';
                            
                            return (
                                <p key={index} className={cn(
                                    "max-sm:text-sm mb-4 p-2 rounded",
                                    message.role === 'assistant' 
                                        ? 'bg-gray-100' 
                                        : 'bg-primary/10 text-primary'
                                )}>
                                    <span className="font-bold">{displayName}:</span> {message.content}
                                </p>
                            );
                        })
                    )}
                </div>
                <div className="transcript-fade absolute bottom-0 left-0 right-0" />
            </section>
        </section>
    )
}

export default CompanionComponent