import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogOverlay,
    DialogPortal,
} from "@/components/ui/dialog"
import SignupPopUp from "./SignupPopUp";
import { Button } from "../ui/button";
import { X } from "lucide-react";


export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
<>
<div className="sm:hidden">
        <Dialog open={open} onOpenChange={onOpenChange} >
            <DialogPortal>
            <DialogOverlay className="bg-transparent fixed inset-0 z-40" />
            {/* <DialogContent className="max-w-[525px] hidden sm:block z-50">
                <DialogClose>
                    <Button className="absolute top-4 right-4" variant="ghost" size="icon"><X className="w-4 h-4" /></Button>
                </DialogClose>
                <SignupPopUp />
            </DialogContent> */}

            <DialogContent
                className="!w-full !max-w-none !rounded-t-2xl !bottom-0 !top-auto !translate-y-0 sm:hidden fixed z-60" 
                style={{ margin: 0 }}>
                <DialogClose>
                    <Button className="absolute top-4 right-4" variant="ghost" size="icon"><X className="w-4 h-4" /></Button>
                </DialogClose>
                <SignupPopUp />
            </DialogContent>
            </DialogPortal>
        </Dialog>
        </div>


        <div className="sm:block hidden">
        <Dialog open={open} onOpenChange={onOpenChange} >
            <DialogPortal>
            <DialogOverlay className="bg-transparent fixed inset-0 z-40" />
            <DialogContent className="max-w-[525px] hidden sm:block z-50">
                <DialogClose>
                    <Button className="absolute top-4 right-4" variant="ghost" size="icon"><X className="w-4 h-4" /></Button>
                </DialogClose>
                <SignupPopUp />
            </DialogContent>

            {/* <DialogContent
                className="!w-full !max-w-none !rounded-t-2xl !bottom-0 !top-auto !translate-y-0 sm:hidden fixed " 
                style={{ margin: 0 }}>
                <DialogClose>
                    <Button className="absolute top-4 right-4" variant="ghost" size="icon"><X className="w-4 h-4" /></Button>
                </DialogClose>
                <SignupPopUp />
            </DialogContent> */}
            </DialogPortal>
        </Dialog>
        </div>




</>
    )
}
