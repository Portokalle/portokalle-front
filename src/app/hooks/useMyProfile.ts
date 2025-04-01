import { useState, useEffect } from "react";
import { db, auth } from "../../../config/firebaseconfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";

export const useMyProfile = () => {
  const { user, role, loading: authLoading } = useAuth(); // Access user, role, and loading from AuthContext
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    about: "",
    specializations: [""],
    education: [""],
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // To handle data fetching state

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData((prev) => ({
            ...prev,
            ...userData,
            specializations: userData.specializations || [""],
            education: userData.education || [""],
          }));
        } else {
          console.warn("User document not found in Firestore.");
          setFormData((prev) => ({
            ...prev,
            email: user?.email || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof formData,
    index?: number
  ) => {
    if (index !== undefined) {
      const updatedArray = [...(formData[field] as string[])];
      updatedArray[index] = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: updatedArray }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleAddField = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }));
  };

  const handleRemoveField = (field: keyof typeof formData, index: number) => {
    const updatedArray = [...(formData[field] as string[])];
    updatedArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: updatedArray }));
  };

  const handlePasswordReset = async () => {
    try {
      const email = formData.email;
      if (!email) throw new Error("Email is required to reset password");

      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Failed to send password reset email. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = user?.uid;
      if (!userId) throw new Error("User not authenticated");

      await setDoc(doc(db, "users", userId), formData, { merge: true });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile!");
    }
  };

  return {
    formData,
    role,
    resetEmailSent,
    isFetching,
    authLoading,
    handleInputChange,
    handleAddField,
    handleRemoveField,
    handlePasswordReset,
    handleSubmit,
  };
};