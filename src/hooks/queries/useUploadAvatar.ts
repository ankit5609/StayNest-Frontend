import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProfilePhoto, type UserDto } from "@/lib/api/users";

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file),
    onSuccess: (url) => {
      // Optimistically merge into cached profile so the UI reflects immediately.
      qc.setQueryData<UserDto | undefined>(["userProfile"], (prev) =>
        prev ? { ...prev, avatarUrl: url } : prev,
      );
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
