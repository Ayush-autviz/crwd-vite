import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DiscardSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onDiscard: () => void;
}

export const DiscardSheet: React.FC<DiscardSheetProps> = ({
    isOpen,
    onClose,
    onDiscard,
}) => {
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="rounded-t-[20px] p-6  mx-auto">
                <SheetHeader className="text-center p-0">
                    <SheetTitle className="text-xl font-bold text-gray-900">
                        Discard changes?
                    </SheetTitle>
                    <SheetDescription className="text-gray-500 mt-2">
                        If you go back now, your progress will be lost.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-3 mt-6">
                    <Button
                        variant="destructive"
                        className="w-full py-6 rounded-xl font-bold text-base"
                        onClick={onDiscard}
                    >
                        Discard
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full py-6 rounded-xl font-semibold text-base bg-gray-100 border-none hover:bg-gray-200"
                        onClick={onClose}
                    >
                        Keep Editing
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
