import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, type ProfileUpdateRequestDto, type UserDto } from "@/lib/api/users";

const PROFILE_KEY = ["userProfile"] as const;

export function useProfile() {
  return useQuery<UserDto>({
    queryKey: PROFILE_KEY,
    queryFn: getProfile,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfileUpdateRequestDto) => updateProfile(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}
