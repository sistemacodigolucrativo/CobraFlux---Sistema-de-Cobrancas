import heroStudioImg from '../assets/images/hero_golden_studio_1794580690028.jpg';
import avatarRafaelImg from '../assets/images/avatar_prof_rafael_1794580690621.jpg';
import avatarCamilaImg from '../assets/images/avatar_prof_camila_1794580690683.jpg';

export const HERO_STUDIO_IMG = heroStudioImg;

export function resolveAvatarUrl(avatarUrl?: string, userId?: string): string | null {
  if (userId === 'usr_rafael' || avatarUrl?.includes('avatar_prof_rafael') || avatarUrl === 'avatar:rafael') {
    return avatarRafaelImg;
  }
  if (userId === 'usr_camila' || avatarUrl?.includes('avatar_prof_camila') || avatarUrl === 'avatar:camila') {
    return avatarCamilaImg;
  }
  if (avatarUrl && !avatarUrl.startsWith('/src/assets/')) {
    return avatarUrl;
  }
  return null;
}
