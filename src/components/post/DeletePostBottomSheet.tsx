import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DeletePostBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export const DeletePostBottomSheet: React.FC<DeletePostBottomSheetProps> = ({
    isOpen,
    onClose,
    onDelete,
    isDeleting = false,
}) => {
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="rounded-t-[20px] p-6 mx-auto border-none">
                <SheetHeader className="text-center p-0">
                    <SheetTitle className="text-xl font-bold text-gray-900">
                        Delete Post?
                    </SheetTitle>
                    <SheetDescription className="text-gray-500 mt-2">
                        This action cannot be undone. Are you sure you want to delete this post from the community?
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-3 mt-6">
                    <Button
                        variant="destructive"
                        className="w-full py-6 rounded-xl font-bold text-base bg-red-600 hover:bg-red-700"
                        onClick={onDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full py-6 rounded-xl font-semibold text-base bg-gray-100 border-none hover:bg-gray-200 text-gray-900"
                        onClick={onClose}
                    >
                        Keep Post
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
