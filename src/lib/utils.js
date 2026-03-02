
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';





export function cn(...inputs) {
	return twMerge(clsx(inputs));
}
