"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, ImageIcon, Link2, Globe, ChevronDown, Check, Heart, Video } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createPost, getLinkPreview, mentionSearch } from "@/services/api/social";
import { getJoinCollective } from "@/services/api/crwd";
import { useAuthStore } from "@/stores/store";
import { MentionSearchResults } from "@/components/post/MentionSearchResults";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import VideoPlayer from "@/components/ui/VideoPlayer";

interface CreatePostBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    collectiveData?: any;
}

export default function CreatePostBottomSheet({
    isOpen,
    onClose,
    collectiveData,
}: CreatePostBottomSheetProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);


    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();

    const isFromSpecificCollective = !!collectiveData;
    const [selectedCollective, setSelectedCollective] = useState<any>(collectiveData || null);

    // Sync selectedCollective when collectiveData prop changes
    useEffect(() => {
        if (collectiveData) {
            setSelectedCollective(collectiveData);
        }
    }, [collectiveData]);

    // Fetch joined collectives for the dropdown
    const { data: joinedCollectivesData } = useQuery({
        queryKey: ['joined-collectives', currentUser?.id],
        queryFn: () => getJoinCollective(currentUser?.id?.toString() || ''),
        enabled: !!currentUser?.id && isOpen,
    });

    const userCollectives = joinedCollectivesData?.data || [];

    const getIconColor = (index: number): string => {
        const colors = ["#1600ff", "#10B981", "#EC4899", "#F59E0B", "#8B5CF6", "#EF4444"];
        return colors[index % colors.length];
    };

    const getIconLetter = (name: string): string => {
        return name.charAt(0).toUpperCase();
    };

    const maxCharacters = 500;
    const [form, setForm] = useState({
        content: "",
        url: "",
    });


    const [postType, setPostType] = useState<"link" | "image" | "video" | "event" | "fundraiser" | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [mentionSearchQuery, setMentionSearchQuery] = useState<string | null>(null);
    const [mentionResults, setMentionResults] = useState<any[]>([]);
    const [selectedMentions, setSelectedMentions] = useState<{ type: string; id: number | string; name: string }[]>([]);
    const [isSearchingMentions, setIsSearchingMentions] = useState(false);

    const validateUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const { data: previewData, isLoading: isLoadingPreview, refetch: fetchPreview } = useQuery({
        queryKey: ['link-preview', form.url],
        queryFn: () => getLinkPreview(form.url),
        enabled: form.url.trim().length > 0 && validateUrl(form.url) && !urlError && isOpen,
    });

    useEffect(() => {
        if (previewData && form.url && validateUrl(form.url) && !urlError) {
            setShowPreview(true);
        } else if (!form.url || !validateUrl(form.url) || urlError) {
            setShowPreview(false);
        }
    }, [previewData, form.url, urlError]);

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            // toast.success("Post created successfully!");

            const collectiveId = selectedCollective?.collective?.id || selectedCollective?.id;
            if (collectiveId) {
                queryClient.invalidateQueries({ queryKey: ['posts', collectiveId.toString()] });
            }
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['communityUpdatesPosts'] });

            setTimeout(() => {
                handleClose();
            }, 1000);
        },
        onError: (error: any) => {
            console.error('Error creating post:', error);
            toast.error("Failed to create post. Please try again.");
        },
    });

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const text = target.innerText;
        let normalizedText = text.replace(/\n$/, ""); // Normalize trailing newline

        if (normalizedText.length > maxCharacters) {
            normalizedText = normalizedText.substring(0, maxCharacters);
        }

        setForm((prev) => ({ ...prev, content: normalizedText }));

        // Mention search logic
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const cursorOffset = range.startOffset;
        const textNode = range.startContainer;

        if (textNode.nodeType === Node.TEXT_NODE) {
            const content = textNode.textContent || "";
            const textBeforeCursor = content.substring(0, cursorOffset);
            const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

            if (lastAtSymbolIndex !== -1) {
                const charBeforeAt = lastAtSymbolIndex > 0 ? textBeforeCursor[lastAtSymbolIndex - 1] : null;
                const isStartOfWord = !charBeforeAt || charBeforeAt === ' ' || charBeforeAt === '\u00A0' || charBeforeAt === '\n';

                if (isStartOfWord) {
                    const query = textBeforeCursor.substring(lastAtSymbolIndex + 1);
                    if (query.split(' ').length <= 3 && !query.includes('\n')) {
                        setMentionSearchQuery(query);
                    } else {
                        setMentionSearchQuery(null);
                    }
                } else {
                    setMentionSearchQuery(null);
                }
            } else {
                setMentionSearchQuery(null);
            }
        } else {
            setMentionSearchQuery(null);
        }
    };

    const handleBeforeInput = (e: any) => {
        const target = e.currentTarget;
        const text = target.innerText.replace(/\n$/, "");
        const selection = window.getSelection();
        const selectedTextLength = selection ? selection.toString().length : 0;

        if ((text.length - selectedTextLength) >= maxCharacters &&
            !e.inputType.startsWith('delete') &&
            !e.inputType.startsWith('history')) {
            e.preventDefault();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text/plain");

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const selectedText = selection.toString();
        const currentText = e.currentTarget.innerText.replace(/\n$/, "");

        const currentLengthWithoutSelection = currentText.length - selectedText.length;
        const remainingChars = maxCharacters - currentLengthWithoutSelection;

        if (remainingChars <= 0) return;

        const truncatedText = pastedText.substring(0, remainingChars);

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(truncatedText);
        range.insertNode(textNode);

        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);

        const newInnerText = e.currentTarget.innerText.replace(/\n$/, "");
        setForm(prev => ({ ...prev, content: newInnerText }));
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        let finalValue = value;
        if (name === "content" && value.length > maxCharacters) {
            finalValue = value.substring(0, maxCharacters);
        }

        setForm((prev) => ({ ...prev, [name]: finalValue }));

        if (name === "url" && urlError) {
            setUrlError(null);
        }
    };


    useEffect(() => {
        if (mentionSearchQuery === null) {
            setMentionResults([]);
            setIsSearchingMentions(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingMentions(true);
            try {
                const data = await mentionSearch(mentionSearchQuery);
                setMentionResults(data.results || (Array.isArray(data) ? data : []));
            } catch (error) {
                console.error('Mention search error:', error);
                setMentionResults([]);
            } finally {
                setIsSearchingMentions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [mentionSearchQuery]);

    const handleMentionSelect = (user: any) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const content = textNode.textContent || "";
        const cursorOffset = range.startOffset;
        const textBeforeCursor = content.substring(0, cursorOffset);
        const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtSymbolIndex === -1) return;

        range.setStart(textNode, lastAtSymbolIndex);
        range.setEnd(textNode, cursorOffset);
        range.deleteContents();

        const mentionName = user.name || user.username;
        const span = document.createElement("span");
        span.textContent = `@${mentionName}`;
        span.className = "mention text-blue-600 font-semibold";
        span.contentEditable = "false";
        span.setAttribute("data-id", user.id.toString());
        span.setAttribute("data-type", user.type);

        range.insertNode(span);

        const space = document.createTextNode("\u00A0");
        range.setStartAfter(span);
        range.insertNode(space);

        range.setStartAfter(space);
        range.setEndAfter(space);

        selection.removeAllRanges();
        selection.addRange(range);

        if (editorRef.current) {
            const innerText = editorRef.current.innerText;
            setForm(prev => ({ ...prev, content: innerText }));
        }

        setSelectedMentions(prev => [
            ...prev.filter(m => m.name !== mentionName),
            { type: user.type, id: user.id, name: mentionName }
        ]);

        setMentionSearchQuery(null);
        setMentionResults([]);
    };


    const handleUrlBlur = () => {
        if (form.url && !validateUrl(form.url)) {
            setUrlError("Oops, this link isn't valid. Double-check, and try again.");
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
        if (e.target) e.target.value = "";
    };

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedVideo(file);
            const videoUrl = URL.createObjectURL(file);
            setVideoPreview(videoUrl);
        }
        if (e.target) e.target.value = "";
    };

    const handlePostTypeSelect = (type: "link" | "image" | "video" | "event") => {
        setPostType(type);
        setForm((prev) => ({ ...prev, url: "" }));
        setSelectedImage(null);
        setImagePreview(null);
        setSelectedVideo(null);
        setVideoPreview(null);
        setUrlError(null);
        if (type === "image" && fileInputRef.current) {
            fileInputRef.current.click();
        } else if (type === "video" && videoInputRef.current) {
            videoInputRef.current.click();
        }
    };

    const canSubmitPost = () => {
        if (!form.content.trim()) return false;
        if (form.url.trim() && (!validateUrl(form.url) || urlError)) return false;
        return true;
    };

    const handleSubmitPost = () => {
        if (!canSubmitPost() || createPostMutation.isPending) return;

        const formData = new FormData();
        const collectiveId = selectedCollective?.collective?.id || selectedCollective?.id;
        if (collectiveId) {
            formData.append('collective_id', collectiveId.toString());
        }
        formData.append('content', form.content);
        formData.append('post_type', selectedCollective ? 'collective' : 'feed');

        const mentionNodes = editorRef.current?.querySelectorAll(".mention");
        const finalMentions = Array.from(mentionNodes || []).map(node => ({
            type: node.getAttribute("data-type"),
            id: node.getAttribute("data-id")
        }));


        if (finalMentions.length > 0) {
            formData.append('mentions', JSON.stringify(finalMentions));
        }

        if (postType === "image" && selectedImage) {
            formData.append('media_file', selectedImage);
        }

        if (postType === "video" && selectedVideo) {
            formData.append('media_file', selectedVideo);
            formData.append('media_type', 'video');
        }

        if (form.url.trim() && validateUrl(form.url)) {
            formData.append('media_url', form.url);
        }

        createPostMutation.mutate(formData);
    };

    const handleClose = () => {
        setForm({ content: "", url: "" });
        if (editorRef.current) {
            editorRef.current.innerHTML = "";
        }
        setPostType(null);

        setSelectedImage(null);
        setImagePreview(null);
        setSelectedVideo(null);
        setVideoPreview(null);
        setSelectedMentions([]);
        onClose();
    };



    const navigate = useNavigate();
    const characterCount = form.content.length;


    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] rounded-t-[20px] p-0 flex flex-col bg-white overflow-hidden outline-none border-none">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-900" />
                        </button>
                        <SheetTitle className="text-[20px] font-bold text-gray-900">Create Post</SheetTitle>
                    </div>
                    <Button
                        onClick={handleSubmitPost}
                        variant={'outline'}
                        disabled={!canSubmitPost() || createPostMutation.isPending}
                        // className="rounded-full font-bold transition-all px-6 py-1.5"
                        style={{
                            // backgroundColor: canSubmitPost() ? '#1600ff' : '#f3f4f6',
                            color: canSubmitPost() ? '#000000' : '#4B5563'

                        }}
                    >
                        {createPostMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : "Post"}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 w-full">
                    <div className="max-w-2xl mx-auto w-full">
                        {/* Collective Selector */}
                        <div className="mb-6">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        disabled={isFromSpecificCollective}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 bg-blue-100 border border-[#cce3ff] rounded-xl text-[#0066ff] transition-all group ${isFromSpecificCollective ? 'cursor-not-allowed opacity-80' : 'hover:bg-[#e6f2ff]'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                                                style={selectedCollective ? {
                                                    backgroundColor: (selectedCollective.collective || selectedCollective).color || getIconColor(0)
                                                } : { backgroundColor: '#f0f7ff' }}
                                            >
                                                {selectedCollective ? (
                                                    (() => {
                                                        const circle = selectedCollective.collective || selectedCollective;
                                                        const hasColor = circle.color;
                                                        const hasLogo = circle.logo && (circle.logo.startsWith("http") || circle.logo.startsWith("/") || circle.logo.startsWith("data:"));
                                                        const showImage = !hasColor && hasLogo;

                                                        if (showImage) return <img src={circle.logo} alt="" className="w-full h-full object-cover" />;
                                                        return <span className="text-white font-bold text-xs">{getIconLetter(circle.name || "C")}</span>;
                                                    })()
                                                ) : <Globe className="w-5 h-5" />}
                                            </div>
                                            <span className="text-sm font-semibold">
                                                Posting to <span className="font-bold">{selectedCollective ? (selectedCollective.collective || selectedCollective).name : "Your Feed"}</span>
                                            </span>
                                        </div>
                                        {!isFromSpecificCollective && <ChevronDown className="w-4 h-4 text-[#0066ff] group-data-[state=open]:rotate-180 transition-transform" />}
                                    </button>
                                </DropdownMenuTrigger>
                                {/* {!isFromSpecificCollective && (
                                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-2 rounded-2xl shadow-2xl border-gray-100 z-[100]" align="start">
                                        <DropdownMenuItem onClick={() => setSelectedCollective(null)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-50">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1"><p className="font-bold text-gray-900">Your Feed</p></div>
                                            {!selectedCollective && <Check className="w-5 h-5 text-blue-600" />}
                                        </DropdownMenuItem>
                                        <div className="px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">YOUR COLLECTIVES</div>
                                        {userCollectives?.map((item: any, index: number) => {
                                            const circle = item.collective || item;
                                            const iconColor = circle.color || (!circle.logo ? getIconColor(index) : undefined);
                                            const isSelected = (selectedCollective?.collective?.id || selectedCollective?.id) === circle.id;
                                            return (
                                                <DropdownMenuItem key={item.id} onClick={() => setSelectedCollective(item)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={iconColor ? { backgroundColor: iconColor } : {}}>
                                                        {circle.logo && !circle.color ? <img src={circle.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-lg">{getIconLetter(circle.name || "C")}</span>}
                                                    </div>
                                                    <div className="flex-1"><p className={`font-bold ${isSelected ? 'text-[#0066ff]' : 'text-gray-900'}`}>{circle.name}</p></div>
                                                    {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                )} */}
                            </DropdownMenu>
                        </div>

                        {/* Main Content Input */}
                        <div className="mb-6">
                            <div className="rounded-xl p-4 bg-[#f6f5ed] focus-within:border-blue-400 transition-all relative min-h-[200px]">
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    onInput={handleInput}
                                    onPaste={handlePaste}
                                    onBeforeInput={handleBeforeInput}
                                    suppressContentEditableWarning
                                    placeholder="What's on your mind?"
                                    className="w-full min-h-[160px] p-0 border-0 bg-transparent text-[16px] text-gray-900 focus:outline-none resize-none placeholder:text-gray-500 empty:before:content-[attr(placeholder)] empty:before:text-gray-500"
                                    style={{ lineHeight: '1.6', outline: 'none' }}
                                />

                                {isSearchingMentions ? (
                                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-2 p-4 z-[110] flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <MentionSearchResults results={mentionResults} onSelect={handleMentionSelect} className="mt-1" position="bottom" />
                                )}
                                <div className="absolute bottom-3 right-4"><span className="text-[13px] font-medium text-gray-400">{characterCount}/{maxCharacters}</span></div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2.5 mb-8">
                            <button onClick={() => handlePostTypeSelect("image")} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"><ImageIcon className="w-5 h-5 text-gray-600" /><span className="text-[14px] font-bold text-gray-800">Add Image</span></button>
                            <button onClick={() => handlePostTypeSelect("link")} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"><Link2 className="w-5 h-5 text-gray-600" /><span className="text-[14px] font-bold text-gray-800">Add Link</span></button>
                            <button onClick={() => handlePostTypeSelect("video")} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"><Video className="w-5 h-5 text-gray-600" /><span className="text-[14px] font-bold text-gray-800">Add Video</span></button>
                            {selectedCollective && (selectedCollective.created_by.id === currentUser?.id) && (
                                <button
                                    onClick={() => navigate(`/create-fundraiser/${(selectedCollective.collective || selectedCollective).id}`)}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"
                                >
                                    <Heart className="w-5 h-5 text-gray-600" />
                                    <span className="text-[14px] font-bold text-gray-800">Create Fundraiser</span>
                                </button>
                            )}
                        </div>

                        {/* Link Input Field */}
                        {(postType === "link" || form.url) && (
                            <div className="mb-4">
                                <div className="relative border border-gray-300 rounded-lg">
                                    <Input name="url" value={form.url} onChange={handleInputChange} onBlur={handleUrlBlur} placeholder="https://example.com/article" className={`px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1600ff] w-full ${form.url ? 'pr-10' : ''}`} />
                                    {form.url && <button onClick={() => { setForm(p => ({ ...p, url: "" })); if (postType === "link") setPostType(null); setShowPreview(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 z-10"><X size={16} /></button>}
                                </div>
                                {urlError && <div className="text-red-500 text-sm mt-2">{urlError}</div>}
                                {form.url && validateUrl(form.url) && !urlError && (
                                    <button onClick={() => fetchPreview()} disabled={isLoadingPreview} className="mt-2 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                        {isLoadingPreview ? <><Loader2 size={16} className="animate-spin" /><span className="text-sm font-medium">Loading Preview...</span></> : <span className="text-sm font-medium">Refresh Preview</span>}
                                    </button>
                                )}
                                {showPreview && previewData && !isLoadingPreview && (
                                    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-white">
                                        <div className="flex flex-col md:flex-row">
                                            {previewData.image && <div className="w-full md:w-48 aspect-[2/1] md:aspect-auto flex-shrink-0"><img src={previewData.image} alt="" className="w-full h-full object-cover" /></div>}
                                            <div className="flex-1 p-3">
                                                {previewData.site_name && <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{previewData.site_name}</div>}
                                                {previewData.title && <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{previewData.title}</h3>}
                                                {previewData.description && <p className="text-xs text-gray-500 mb-1 line-clamp-2">{previewData.description}</p>}
                                                {previewData.domain && <div className="text-[11px] text-gray-500 truncate">{previewData.domain}</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Image Preview */}
                        {selectedImage && imagePreview && (
                            <div className="mb-4">
                                <div className="relative rounded-lg overflow-hidden w-fit max-w-[600px] max-h-[200px]">
                                    <img src={imagePreview} alt="Selected" className="max-h-[200px] object-contain rounded-lg" />
                                    <button onClick={() => { setSelectedImage(null); setImagePreview(null); if (postType === "image") setPostType(null); }} className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"><X size={16} /></button>
                                </div>
                            </div>
                        )}

                        {/* Video Preview */}
                        {selectedVideo && videoPreview && (
                            <div className="mb-4">
                                <div className="relative rounded-lg overflow-hidden w-fit max-w-[600px] max-h-[300px]">
                                    <VideoPlayer src={videoPreview} className="max-h-[300px]" disableFullscreen={true} />
                                    <button onClick={() => { setSelectedVideo(null); setVideoPreview(null); if (postType === "video") setPostType(null); }} className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white z-10"><X size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* <div className="p-4  max-w-2xl mx-auto w-full">
                    <div className="text-right mb-4"><span className="text-[13px] font-medium text-gray-400">{characterCount}/{maxCharacters}</span></div>

                    <div className="flex flex-wrap gap-2.5 mb-8">
                        <button onClick={() => handlePostTypeSelect("image")} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"><ImageIcon className="w-5 h-5 text-gray-600" /><span className="text-[14px] font-bold text-gray-800">Add Image</span></button>
                        <button onClick={() => handlePostTypeSelect("link")} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"><Link2 className="w-5 h-5 text-gray-600" /><span className="text-[14px] font-bold text-gray-800">Add Link</span></button>
                        {selectedCollective && (selectedCollective.created_by.id === currentUser?.id) && (
                            <button
                                onClick={() => navigate(`/create-fundraiser/${(selectedCollective.collective || selectedCollective).id}`)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"
                            >
                                <Heart className="w-5 h-5 text-gray-600" />
                                <span className="text-[14px] font-bold text-gray-800">Create Fundraiser</span>
                            </button>
                        )}
                    </div>
                </div> */}

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoSelect} />
            </SheetContent>
        </Sheet>
    );
}
