"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { CustomQuestion, QuestionType } from "@/lib/types";

interface QuestionBuilderProps {
    value: CustomQuestion[];
    onChange: (questions: CustomQuestion[]) => void;
}

const TYPES: { value: QuestionType; label: string }[] = [
    { value: "short", label: "Short answer" },
    { value: "long", label: "Long answer" },
    { value: "choice", label: "Pick one" },
];

export function QuestionBuilder({ value, onChange }: QuestionBuilderProps) {
    function update(index: number, patch: Partial<CustomQuestion>) {
        onChange(value.map((q, i) => (i === index ? { ...q, ...patch } : q)));
    }

    function add() {
        onChange([
            ...value,
            {
                id: `q${Date.now().toString(36)}`,
                label: "",
                type: "short",
                required: false,
                options: [],
            },
        ]);
    }

    return (
        <div className="space-y-5">
            {value.length === 0 && (
                <p className="text-ink-faint text-sm">
                    No extra questions. Guests will only be asked for a name, email and
                    an optional note.
                </p>
            )}

            {value.map((question, index) => (
                <div key={question.id} className="border-rule space-y-4 border p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2.5">
                            <Label htmlFor={`question-${question.id}`}>
                                Question {index + 1}
                            </Label>
                            <Input
                                id={`question-${question.id}`}
                                value={question.label}
                                onChange={(e) => update(index, { label: e.target.value })}
                                placeholder="Any dietary requirements?"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="mt-7"
                            onClick={() => onChange(value.filter((_, i) => i !== index))}
                            aria-label={`Remove question ${index + 1}`}
                        >
                            <Trash2 />
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2.5">
                            <Label>Answer type</Label>
                            <Select
                                value={question.type}
                                onValueChange={(type) =>
                                    update(index, { type: type as QuestionType })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:pt-7">
                            <Label htmlFor={`required-${question.id}`}>Required</Label>
                            <Switch
                                id={`required-${question.id}`}
                                checked={question.required}
                                onCheckedChange={(required) => update(index, { required })}
                            />
                        </div>
                    </div>

                    {question.type === "choice" && (
                        <div className="space-y-2.5">
                            <Label htmlFor={`options-${question.id}`}>
                                Options, comma separated
                            </Label>
                            <Input
                                id={`options-${question.id}`}
                                value={question.options.join(", ")}
                                onChange={(e) =>
                                    update(index, {
                                        options: e.target.value
                                            .split(",")
                                            .map((option) => option.trim())
                                            .filter(Boolean),
                                    })
                                }
                                placeholder="Chicken, Fish, Vegetarian"
                            />
                        </div>
                    )}
                </div>
            ))}

            {value.length < 10 && (
                <Button type="button" variant="subtle" size="sm" onClick={add}>
                    <Plus />
                    Add question
                </Button>
            )}
        </div>
    );
}
