import { useAuthStore } from "@/stores/store";

export default function HelloGreeting() {
  const { user } = useAuthStore();

  // Get user's first name or fallback to a default
  const getUserName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    if (user?.username) {
      return user.username;
    }
    return "there";
  };

  const userName = getUserName();

  return (
    <div className="w-full md:max-w-2xl md:mx-auto">
      <h1 className="text-base xs:text-lg md:text-2xl font-bold text-foreground mb-3 ">
        Hi {userName}!, You're making a difference.
      </h1>
    </div>
  );
}



