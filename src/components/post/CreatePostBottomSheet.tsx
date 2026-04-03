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
import { X, Loader2, ImageIcon, Link2, Globe, ChevronDown, Check, Heart } from "lucide-react";
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);
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

    const [form, setForm] = useState({
        content: "",
        url: "",
    });

    const [postType, setPostType] = useState<"link" | "image" | "event" | "fundraiser" | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (name === "url" && urlError) {
            setUrlError(null);
        }

        if (name === "content") {
            const cursorPosition = (e.target as HTMLTextAreaElement).selectionStart;
            const textBeforeCursor = value.substring(0, cursorPosition);
            const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

            if (lastAtSymbolIndex !== -1) {
                const charBeforeAt = lastAtSymbolIndex > 0 ? textBeforeCursor[lastAtSymbolIndex - 1] : null;
                const isStartOfWord = !charBeforeAt || charBeforeAt === ' ' || charBeforeAt === '\n';

                if (isStartOfWord) {
                    const query = textBeforeCursor.substring(lastAtSymbolIndex + 1);
                    const isAlreadySelected = selectedMentions.some(m =>
                        query === m.name || query === m.name + ' ' || query.startsWith(m.name + ' ')
                    );

                    if (!isAlreadySelected && query.split(' ').length <= 3 && !query.includes('\n')) {
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
        const cursorPosition = textareaRef.current?.selectionStart || 0;
        const textBeforeCursor = form.content.substring(0, cursorPosition);
        const textAfterCursor = form.content.substring(cursorPosition);
        const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
        const mentionName = user.name || user.username;
        const newTextBeforeCursor = textBeforeCursor.substring(0, lastAtSymbolIndex) + `@${mentionName} `;

        setForm(prev => ({ ...prev, content: newTextBeforeCursor + textAfterCursor }));
        setSelectedMentions(prev => [
            ...prev.filter(m => m.name !== mentionName),
            { type: user.type, id: user.id, name: mentionName }
        ]);
        setMentionSearchQuery(null);
        setMentionResults([]);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = newTextBeforeCursor.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
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

    const handlePostTypeSelect = (type: "link" | "image" | "event") => {
        setPostType(type);
        setForm((prev) => ({ ...prev, url: "" }));
        setSelectedImage(null);
        setImagePreview(null);
        setUrlError(null);
        if (type === "image" && fileInputRef.current) {
            fileInputRef.current.click();
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

        const finalMentions = selectedMentions
            .filter(m => form.content.includes(`@${m.name}`))
            .map(({ type, id }) => ({ type, id }));

        if (finalMentions.length > 0) {
            formData.append('mentions', JSON.stringify(finalMentions));
        }

        if (postType === "image" && selectedImage) {
            formData.append('media_file', selectedImage);
        }

        if (form.url.trim() && validateUrl(form.url)) {
            formData.append('media_url', form.url);
        }

        createPostMutation.mutate(formData);
    };

    const handleClose = () => {
        setForm({ content: "", url: "" });
        setPostType(null);
        setSelectedImage(null);
        setImagePreview(null);
        setSelectedMentions([]);
        onClose();
    };

    const renderHighlightedText = (text: string) => {
        if (!text) return null;
        const mentionNames = selectedMentions.map(m => `@${m.name}`);
        const mentionNamesLower = mentionNames.map(n => n.toLowerCase());
        mentionNames.sort((a, b) => b.length - a.length);

        if (mentionNames.length === 0) {
            return text.split(/(@[\w\s]{1,30}(?=\s|$)|@\w+)/g).map((part, index) => {
                if (part.startsWith('@')) {
                    return <span key={index} className="text-blue-600 font-medium">{part}</span>;
                }
                return <span key={index}>{part}</span>;
            });
        }

        const pattern = mentionNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const regex = new RegExp(`(${pattern})`, 'gi');

        return text.split(regex).map((part, index) => {
            if (mentionNamesLower.includes(part.toLowerCase())) {
                return <span key={index} className="text-blue-600 font-medium">{part}</span>;
            }
            return part.split(/(@[\w\s]{1,30}(?=\s|$)|@\w+)/g).map((subPart, subIndex) => {
                if (subPart.startsWith('@')) {
                    return <span key={`${index}-${subIndex}`} className="text-blue-600 font-medium">{subPart}</span>;
                }
                return <span key={`${index}-${subIndex}`}>{subPart}</span>;
            });
        });
    };

    const navigate = useNavigate();
    const characterCount = form.content.length;
    const maxCharacters = 500;

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
                                <div className="absolute inset-x-4 inset-y-4 text-[16px] whitespace-pre-wrap break-words pointer-events-none text-gray-900 border-none" style={{ font: 'inherit', lineHeight: '1.6' }}>
                                    {renderHighlightedText(form.content)}{form.content.endsWith('\n') ? '\n' : ''}
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    name="content"
                                    value={form.content}
                                    onChange={handleInputChange}
                                    placeholder="What's on your mind? Share your thoughts, updates, or stories..."
                                    className="w-full min-h-[160px] p-0 border-0 bg-transparent text-[16px] focus:outline-none resize-none placeholder:text-gray-500 relative z-10 text-transparent caret-blue-600"
                                    style={{ lineHeight: '1.6' }}
                                    maxLength={maxCharacters}
                                />
                                {isSearchingMentions ? (
                                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-2 p-4 z-[110] flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <MentionSearchResults results={mentionResults} onSelect={handleMentionSelect} className="mt-1" position="bottom" />
                                )}
                                {/* <div className="absolute bottom-3 right-4"><span className="text-[13px] font-medium text-gray-400">{characterCount}/{maxCharacters}</span></div> */}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {/* <div className="flex flex-wrap gap-2.5 mb-8">
                            <button onClick={() => handlePostTypeSelect("image")} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"><ImageIcon className="w-5 h-5 text-gray-600" /><span className="text-[14px] font-bold text-gray-800">Add Image</span></button>
                            <button onClick={() => handlePostTypeSelect("link")} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"><Link2 className="w-5 h-5 text-gray-600" /><span className="text-[14px] font-bold text-gray-800">Add Link</span></button>
                            {selectedCollective && (selectedCollective.role === "admin" || selectedCollective.role === "Admin") && (
                                <button
                                    onClick={() => navigate(`/create-fundraiser/${(selectedCollective.collective || selectedCollective).id}`)}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"
                                >
                                    <Heart className="w-5 h-5 text-gray-600" />
                                    <span className="text-[14px] font-bold text-gray-800">Create Fundraiser</span>
                                </button>
                            )}
                        </div> */}

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
                                <div className="relative rounded-lg overflow-hidden w-fit max-w-[600px] max-h-[180px]">
                                    <img src={imagePreview} alt="Selected" className="max-h-[180px] object-contain rounded-lg" />
                                    <button onClick={() => { setSelectedImage(null); setImagePreview(null); if (postType === "image") setPostType(null); }} className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"><X size={16} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4  max-w-2xl mx-auto w-full">
                    <div className="text-right mb-4"><span className="text-[13px] font-medium text-gray-400">{characterCount}/{maxCharacters}</span></div>

                    <div className="flex flex-wrap gap-2.5 mb-8">
                        <button onClick={() => handlePostTypeSelect("image")} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"><ImageIcon className="w-5 h-5 text-gray-600" /><span className="text-[14px] font-bold text-gray-800">Add Image</span></button>
                        <button onClick={() => handlePostTypeSelect("link")} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"><Link2 className="w-5 h-5 text-gray-600" /><span className="text-[14px] font-bold text-gray-800">Add Link</span></button>
                        {selectedCollective && (selectedCollective.role === "admin" || selectedCollective.role === "Admin") && (
                            <button
                                onClick={() => navigate(`/create-fundraiser/${(selectedCollective.collective || selectedCollective).id}`)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all"
                            >
                                <Heart className="w-5 h-5 text-gray-600" />
                                <span className="text-[14px] font-bold text-gray-800">Create Fundraiser</span>
                            </button>
                        )}
                    </div>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
            </SheetContent>
        </Sheet>
    );
}
