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
    <div className="px-4 mt-6 md:px-0 md:mt-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        Hi {userName}, keep up the great work!
      </h1>
    </div>
  );
}

