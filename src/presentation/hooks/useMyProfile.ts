import { useState, useEffect } from "react";
import { useAuth } from "@/presentation/context/AuthContext";
import { useDI } from "@/presentation/context/DIContext";

export const useMyProfile = () => {
  const { user, role, loading: authLoading } = useAuth(); // Access user, role, and loading from AuthContext
  const { fetchUserProfileUseCase, updateUserProfileUseCase, sendPasswordResetUseCase } = useDI();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    about: "",
    specializations: [""],
    education: [""],
    profilePicture: "",
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // To handle data fetching state
  const [uploading, setUploading] = useState(false);
  // Handle profile picture upload
  const handleProfilePictureChange = async (file: File) => {
    if (!user?.uid) return;
    setUploading(true);
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);

      // Upload via our API route (which will handle the Spaces upload server-side)
      const uploadRes = await fetch('/api/profile/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();

        throw new Error('Failed to upload: ' + errorText);
      }

      const { publicUrl } = await uploadRes.json();
      if (!publicUrl) throw new Error('No public URL returned from upload');

      // Update Firestore with the new profile picture URL
      setFormData((prev) => ({ ...prev, profilePicture: publicUrl }));
      await updateUserProfileUseCase.execute(user.uid, { profilePicture: publicUrl });
      
    } catch {
  alert('Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  // Helper to check if profile is complete
  // Removed unused checkProfileComplete function

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        const userData = await fetchUserProfileUseCase.execute(user.uid);
        if (userData) {
          setFormData((prev) => ({
            ...prev,
            ...userData,
            specializations: userData.specializations || [""],
            education: userData.education || [""],
          }));
        }
  } catch {
  } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [user, fetchUserProfileUseCase]);

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
      await sendPasswordResetUseCase.execute(email);
      setResetEmailSent(true);
      alert("Password reset email sent. Please check your inbox.");
    } catch {
      alert("Failed to send password reset email. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = user?.uid;
      if (!userId) throw new Error("User not authenticated");

      await updateUserProfileUseCase.execute(userId, formData);
      alert("Profile updated successfully!");
    } catch {
  alert("Failed to update profile!");
    }
  };

  return {
    formData,
    role,
    resetEmailSent,
    isFetching,
    authLoading,
    uploading,
    handleInputChange,
    handleAddField,
    handleRemoveField,
    handlePasswordReset,
    handleSubmit,
    handleProfilePictureChange,
  };
};
