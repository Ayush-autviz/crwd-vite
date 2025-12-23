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
    <div className="w-full mt-2 md:mt-6 lg:mt-8 xl:mt-10 2xl:mt-12">
      <h1 className="text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 px-0">
        Hi {userName}, keep up the great work!
      </h1>
    </div>
  );
}



