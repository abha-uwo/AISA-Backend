import { atom } from "recoil"

const getAvatarUrl = (user) => {
  if (!user || !user.email) return "";
  const encodedName = encodeURIComponent(user.name || "User");
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;

  // If it's a Gmail address, specifically ask for the Google avatar
  if (user.email.toLowerCase().includes('@gmail.com')) {
    return `https://unavatar.io/google/${user.email}?fallback=${encodeURIComponent(fallbackUrl)}`;
  }

  // Default to generic for others
  return `https://unavatar.io/${user.email}?fallback=${encodeURIComponent(fallbackUrl)}`;
};

const processUser = (user) => {
  if (user) {
    // Always attempt to set a better avatar if one isn't explicitly set, is the default, or is a relative path
    if (!user.avatar || user.avatar.includes('gravatar.com') || user.avatar === '/User.jpeg' || user.avatar.startsWith('/')) {
      return { ...user, avatar: getAvatarUrl(user) };
    }
  }
  return user;
};

export const setUserData = (data) => {
  const existing = JSON.parse(localStorage.getItem('user') || '{}');
  const token = data.token || existing.token;
  const processedData = processUser(data);
  const finalData = { ...processedData, token };
  localStorage.setItem("user", JSON.stringify(finalData));
}
export const getUserData = () => {
  const data = JSON.parse(localStorage.getItem('user'))
  return processUser(data);
}
export const clearUser = () => {
  localStorage.clear()
}
const getUser = () => {
  try {
    const item = localStorage.getItem('user');
    if (!item || item === "undefined" || item === "null") return null;
    const user = JSON.parse(item);
    if (user) {
      return processUser(user)
    }
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
    localStorage.removeItem('user'); // Clear corrupted data
  }
  return null
}
export const toggleState = atom({
  key: "toggle",
  default: { subscripPgTgl: false, notify: false, sidebarOpen: false, platformSubTgl: false }
})

export const userData = atom({
  key: 'userData',
  default: { user: getUser() }
})

export const sessionsData = atom({
  key: 'sessionsData',
  default: []
})