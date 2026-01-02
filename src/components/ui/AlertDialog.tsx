"use client"

import * as React from "react"
import { AlertCircle, X } from "lucide-react"
import { Button } from "./Button"
import { Card, CardContent } from "./Card"
import { cn } from "@/lib/utils"
import { Portal } from "./Portal"

interface AlertDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "destructive" | "warning" | "default"
    isLoading?: boolean
}

export function AlertDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Konfirmasi",
    cancelText = "Batal",
    variant = "destructive",
    isLoading = false
}: AlertDialogProps) {
    if (!isOpen) return null

    const variantStyles = {
        destructive: "bg-red-500 hover:bg-red-600 shadow-red-100",
        warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-100",
        default: "bg-slate-900 hover:bg-slate-800 shadow-slate-100"
    }

    const iconStyles = {
        destructive: "bg-red-50 text-red-500",
        warning: "bg-amber-50 text-amber-500",
        default: "bg-slate-50 text-slate-500"
    }

    return (
        <Portal>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-sans">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <div className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-300">
                    <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center space-y-5">
                                {/* Icon Header */}
                                <div className={cn("size-16 rounded-2xl flex items-center justify-center shadow-sm", iconStyles[variant])}>
                                    <AlertCircle className="size-8 stroke-[2.5px]" />
                                </div>

                                {/* Text Content */}
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        {description}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col w-full gap-3 pt-2">
                                    <Button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={cn(
                                            "h-12 text-sm font-bold rounded-xl transition-all active:scale-95 shadow-lg",
                                            variantStyles[variant]
                                        )}
                                    >
                                        {isLoading ? "Memproses..." : confirmText}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="h-12 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl"
                                    >
                                        {cancelText}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Portal>
    )
}
