"use client"

import { z } from "zod"
import React from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subjects } from "@/constants";
import { Textarea } from "@/components/ui/textarea";
import {createCompanion, type CompanionFormData} from "@/lib/actions/companion.client";
import {useRouter} from "next/navigation";

const formSchema = z.object({
    name: z.string().min(1,{message:'Companion is required.'}),
    subject: z.string().min(1,{message:'Subject is required.'}),
    topic: z.string().min(1,{message:'Topic is required.'}),
    voice: z.string().min(1,{message:'Voice is required.'}),
    style: z.string().min(1,{message:'Style is required.'}),
    duration: z.coerce.number().min(1,{message:'Duration is required.'}),
})

const CompanionForm = () => {
    const router = useRouter();
    
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            subject: '',
            topic: '',
            voice: '',
            style: '',
            duration: 15,
        },
    })

    // 2. Define a submit handler.
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const companionData: CompanionFormData = {
                name: values.name,
                subject: values.subject,
                topic: values.topic,
                voice: values.voice,  // Fixed: use voice instead of personality
                style: values.style,
                duration: values.duration,  // Added duration
            };
            
            const companion = await createCompanion(companionData);
            if(companion){
                router.push(`/companions/${companion.id}`);
            } else {
                console.log("Companion creation failed!!");
                router.push('/');
            }
        } catch (error) {
            console.error('Error creating companion:', error);
            router.push('/');
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Companion name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the companion name" {...field}
                                className="input"
                                />
                            </FormControl>
                            <FormDescription>
                                The name of your AI companion.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="input capitalize">
                                        <SelectValue placeholder="Select the subject" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject} value={subject} className="capitalize">
                                                {subject}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                            </FormControl>
                            <FormDescription>
                                Select the subject area for your companion.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>What should the companion help with?</FormLabel>
                            <FormControl>

                                <Textarea
                                    placeholder="Ex. Derivatives and Integrals" {...field}
                                       className="input"
                                />
                            </FormControl>
                            <FormDescription>
                                Describe the specific topics your companion will assist with.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="voice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Voice</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="input">
                                        <SelectValue placeholder="Select the voice"
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="male">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="female">
                                            Female
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                            </FormControl>
                            <FormDescription>
                                Choose the voice type for your companion.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Style</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="input">
                                        <SelectValue placeholder="Select the style"
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="formal">
                                            Formal
                                        </SelectItem>
                                        <SelectItem value="casual">
                                            Casual
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                            </FormControl>
                            <FormDescription>
                                Choose the communication style for your companion.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />



                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estimated Session Duration</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="15" {...field}
                                    className="input"
                                />
                            </FormControl>
                            <FormDescription>
                                Enter the estimated duration in minutes for each session.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full cursor-pointer">Build Your own Companion</Button>
            </form>
        </Form>
    )
}
export default CompanionForm
