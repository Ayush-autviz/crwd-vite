import { useState, useRef, useEffect } from "react";
import GroupCrwdHeader from "../components/groupcrwd/GroupCrwdHeader";
import GroupCrwdSuggested from "../components/groupcrwd/GroupCrwdSuggested";
import GroupCrwdUpdates from "../components/groupcrwd/GroupCrwdUpdates";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Footer from "@/components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { SharePost } from "@/components/ui/SharePost";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Loader2, X } from "lucide-react";
import ReactConfetti from "react-confetti";
import { getCollectiveById, joinCollective, leaveCollective } from "@/services/api/crwd";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function GroupCrwdPage() {
  const [hasJoined, setHasJoined] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const windowDimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const navigate = useNavigate();
  const { crwdId } = useLocation().state;

  console.log(crwdId);

  const { data: crwdData, isLoading: isLoadingCrwd } = useQuery({
    queryKey: ['crwd', crwdId],
    queryFn: () => getCollectiveById(crwdId),
  });

  // join collective
  const joinCollectiveMutation = useMutation({
    mutationFn: joinCollective,
    onSuccess: (response) => {
      console.log('Join collective successful:', response);
      setHasJoined(true);
      setShowToast(true);
      setShowJoinModal(false);
      setShowSuccessModal(true);
    },
    onError: (error: any) => {
      console.error('Join collective error:', error);
      setShowToast(true);
    },
  });

  // leave collective
  const leaveCollectiveMutation = useMutation({
    mutationFn: leaveCollective,
    onSuccess: (response) => {
      console.log('Leave collective successful:', response);
      setHasJoined(false);
      setShowToast(true);
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      console.error('Leave collective error:', error);
      setShowToast(true);
    },
  });
  
  // Refs for modal outside click detection
  const joinModalRef = useRef<HTMLDivElement>(null);
  const successModalRef = useRef<HTMLDivElement>(null);

  // Handle outside click for join modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        joinModalRef.current &&
        !joinModalRef.current.contains(event.target as Node)
      ) {
        setShowJoinModal(false);
      }
    };

    if (showJoinModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showJoinModal]);

  // Handle outside click for success modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        successModalRef.current &&
        !successModalRef.current.contains(event.target as Node)
      ) {
        setShowSuccessModal(false);
      }
    };

    if (showSuccessModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuccessModal]);

  // const handleJoinClick = () => {
  //   setShowJoinModal(true);
  // };

  const handleCloseModal = () => {
    setShowJoinModal(false);
  };

  const handleJoinConfirm = () => {
    joinCollectiveMutation.mutate(crwdId);
    // setHasJoined(true);
    // setShowJoinModal(false);
    // setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleJoin = () => {
    if (hasJoined) {
      // If already joined, show confirmation dialog before unjoining
      setShowConfirmDialog(true);
    } else {
      // If not joined, join directly
      setShowJoinModal(true);
      // setHasJoined(true);
      // setShowToast(true);
    }
  };

  const handleConfirmUnjoin = () => {
    if (!leaveCollectiveMutation.isPending) {
      leaveCollectiveMutation.mutate(crwdId);
    }
  };

  useEffect(() => {
    if (crwdData?.is_joined !== undefined) {
      setHasJoined(crwdData.is_joined);
    }
  }, [crwdData]);

  return (
    // <div>
    <>
      <ProfileNavbar title="Collective" />
      {isLoadingCrwd ? (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
      <div className="flex items-center gap-2 justify-between pt-6 pb-2 px-4 sticky top-16 z-10 bg-white ">
        <div className="text-lg font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-md">
          Collective
        </div>
        <div className="flex items-center gap-2">
          {hasJoined && (
            <Button
              onClick={() => navigate("/donation" + "/?tab=onetime")}
              variant="default"
            >
              Donate
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowShareModal(true)}>
            {/* <Share2 size={20} /> */}
            Share
          </Button>

          <Button
            className={`cursor-pointer transition-colors ${
              hasJoined
                ? "bg-gray-100 text-gray-500"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            onClick={handleJoin}
            variant={hasJoined ? "outline" : "default"}
            disabled={joinCollectiveMutation.isPending || leaveCollectiveMutation.isPending}
          >
            {joinCollectiveMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-1 animate-spin" />
                Joining...
              </>
            ) : leaveCollectiveMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-1 animate-spin" />
                Leaving...
              </>
            ) : hasJoined ? (
              <>
                <Check size={16} className="mr-1" />
                Joined
              </>
            ) : (
              "Join This Collective"
            )}
          </Button>
        </div>
      </div>
      {/* <SharePost url={window.location.href} title="Feed the hungry - CRWD" description="Join us in supporting families experiencing food insecurity in the greater Atlanta area." /> */}
      <div className="pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* <ProfileNavbar title='Group Crwd' /> */}
          <GroupCrwdHeader hasJoined={hasJoined} onJoin={handleJoin} id="" crwdData={crwdData} />
          {/* <div className="px-4">
            <PopularPosts title="Activity" showLoadMore={false} />
            </div> */}
          <GroupCrwdUpdates showEmpty={false} joined={hasJoined} collectiveData={crwdData} />
          <GroupCrwdSuggested />
          {/* <GroupCrwdEvent /> */}
          {/* {!hasJoined && <GroupCrwdBottomBar onJoin={handleJoin} />} */}
          {/* <div className="h-24  md:hidden" /> */}

          {showJoinModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div
                ref={joinModalRef}
                className="bg-white rounded-lg max-w-md w-full mx-4 p-6 relative"
              >
                {/* Close Button */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>

                {/* Modal Content */}
                <div className="text-center">
                  {/* <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-blue-600" />
              </div> */}

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Join "Save the Trees Atlanta"?
                  </h2>

                  <p className="text-gray-600 mb-6">
                    This CRWD includes 3 nonprofits.
                  </p>

                  <div className="flex items-center justify-center gap-3">
                    <Button onClick={handleCloseModal} variant="outline">
                      Learn More
                    </Button>
                    <Button className="px-10" onClick={handleJoinConfirm}>
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showSuccessModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <ReactConfetti
                width={windowDimensions.width}
                height={windowDimensions.height}
                recycle={false}
                numberOfPieces={200}
              />
              <div
                ref={successModalRef}
                className="bg-white rounded-lg max-w-md w-full mx-4 p-6 relative"
              >
                {/* Close Button */}
                <button
                  onClick={handleCloseSuccessModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>

                {/* Modal Content */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    You've joined Save the Trees Atlanta!
                  </h2>

                  <p className="text-gray-600 mb-4">
                    Welcome to the community.
                  </p>

                  <p className="text-gray-600 mb-4">
                    Here's what's inside your CRWD:
                  </p>

                  {/* Community Info Card */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          🌳
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          Save the Trees Atlanta
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex -space-x-2">
                            <img
                              src="https://randomuser.me/api/portraits/men/32.jpg"
                              alt="avatar"
                              className="w-6 h-6 rounded-full"
                            />
                            <img
                              src="https://randomuser.me/api/portraits/men/30.jpg"
                              alt="avatar"
                              className="w-6 h-6 rounded-full"
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            44 members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6">
                    We've added 3 nonprofits from Save the Trees Atlanta to your
                    donation box. You can edit or remove them any time.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Button onClick={handleCloseSuccessModal}>
                      GO TO CRWD
                    </Button>

                    <Button
                      onClick={handleCloseSuccessModal}
                      variant="outline"
                      className="w-full"
                    >
                      MANAGE DONATIONS
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* <div className="lg:col-span-1 space-y-6 px-4 pb-35">
    
          <Card className='hidden md:block'>
            <CardContent>
              <h2 className="text-xl font-bold mb-4 text-center">
                Support this cause
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                Your donation helps provide meals to families in need
                throughout the greater Atlanta area.
              </p>
              <Link to="/donation">
                <Button
                  className="w-full py-6 text-lg bg-[#4367FF] hover:bg-[#4367FF] hover:opacity-85"
                  size="lg"
                >
                  Join
                </Button>
              </Link>
              <div className="text-center text-sm text-muted-foreground mt-4">
                100% of donations go directly to providing meals
              </div>
            </CardContent>
          </Card>

         
          <Card className='hidden md:block'>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Related Causes</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-card  "
                  >
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 mr-2">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0">
                        <img
                          src={`/placeholder.svg?height=60&width=60`}
                          alt={`Cause ${i}`}
                          className="object-cover"
                        />
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          Community Garden Project
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          42 members
                        </p>
                      </div>
                    </div>
                    <Link to="/cause">
                      <Button className="bg-primary text-white text-xs h-8 px-4 md:px-6 flex-shrink-0 cursor-pointer">
                        Visit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

      
          <Card className='hidden md:block'>
            <CardContent className="">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="User"
                    />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Sarah J.</span> donated{" "}
                      <span className="font-medium">$50</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="User"
                    />
                    <AvatarFallback>MT</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Michael T.</span> joined
                      the cause
                    </p>
                    <p className="text-xs text-muted-foreground">
                      5 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="User"
                    />
                    <AvatarFallback>LR</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Lisa R.</span> donated{" "}
                      <span className="font-medium">$25</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>

      <Toast
        show={showToast}
        onHide={() => setShowToast(false)}
        message={
          hasJoined ? "You have joined the group" : "You have left the group"
        }
      />

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this group? You can always join
              back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={leaveCollectiveMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmUnjoin}
              disabled={leaveCollectiveMutation.isPending}
            >
              {leaveCollectiveMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-1 animate-spin" />
                  Leaving...
                </>
              ) : (
                "Leave Group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SharePost
        url={window.location.origin + `/groupcrwd/`}
        title={`Check out this CRWD Collective`}
        description="Join us in supporting families experiencing food insecurity in the greater Atlanta area."
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Footer */}
      <div className="">
        <Footer />
      </div>
      </>
      )}
    </>
  );
}
