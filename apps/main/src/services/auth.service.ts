import { api } from "../lib/axios";

// ─── Request Types ───

// Login
export interface LoginPayload {
	username: string;
	password: string;
}

// Signup
export interface SignupEmailPayload {
	email: string;
	user_type: string; // "Freelancer" | "Client"
}

export interface VerifyTokenPayload {
	email: string;
	token: string;
}

export interface CreatePasswordPayload {
	password: string;
	confirm_password: string;
}

export interface AddProfilePayload {
	first_name: string;
	last_name: string;
	gender: string;
	date_of_birth: string;
	country: string;
	code: string;
	phone_number: string;
	profile_picture?: File | null;
}

// ─── Response Types ───

// Current User
export interface CurrentUserResponse {
	id: string;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	created_at: string;
	user_role: "Freelancer" | "Client";
}

// Logout
export interface LogoutResponse {
	message: string;
}

// Login
export interface LoginResponse {
	message: string;
	user: {
		id: string;
		username: string;
		email: string;
		first_name: string;
		last_name: string;
		created_at: string;
		user_role: "Freelancer" | "Client";
	};
	token: string;
	expires_at: string;
	user_role: "Freelancer" | "Client";
}

// Signup
export interface SignupEmailResponse {
	message: string;
	otp_code?: string;
	token?: number; // legacy field name used by older backends
	warning?: string;
	info?:
		| {
				expires_in_seconds: number;
				resend_after_seconds: number;
				username?: string;
		  }
		| string; // legacy: some backends returned a plain string
}

export interface VerifyTokenResponse {
	message: string;
	token: string;
	expire_at: string;
}

export interface CreatePasswordResponse {
	message: string;
}

export interface AddProfileResponse {
	message: string;
}

// ─── API Calls ───

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
	const response = await api.get<CurrentUserResponse>("/auth/me/");
	return response.data;
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<LogoutResponse> => {
	const response = await api.post<LogoutResponse>("/auth/logoutall/");
	return response.data;
};

/**
 * Login with email/username and password
 */
export const login = async (
	payload: LoginPayload,
): Promise<LoginResponse> => {
	const response = await api.post<LoginResponse>("/auth/login/", payload);
	return response.data;
};

/**
 * Step 1: Send email to receive OTP token
 */
export const signupWithEmail = async (
	payload: SignupEmailPayload,
): Promise<SignupEmailResponse> => {
	const response = await api.post<SignupEmailResponse>(
		"/auth/signup/email/",
		payload,
	);
	return response.data;
};

/**
 * Step 2: Verify the OTP token sent to email
 */
export const verifySignupToken = async (
	payload: VerifyTokenPayload,
): Promise<VerifyTokenResponse> => {
	const response = await api.post<VerifyTokenResponse>(
		"/auth/signup/verify-token/",
		payload,
	);
	return response.data;
};

/**
 * Step 3: Create password (requires auth token from verify step)
 */
export const createPassword = async (
	payload: CreatePasswordPayload,
): Promise<CreatePasswordResponse> => {
	const response = await api.post<CreatePasswordResponse>(
		"/auth/signup/create-password/",
		payload,
	);
	return response.data;
};

/**
 * Step 4: Add profile information (requires auth token)
 */
export const addProfile = async (
	payload: AddProfilePayload,
): Promise<AddProfileResponse> => {
	const formData = new FormData();

	formData.append("first_name", payload.first_name);
	formData.append("last_name", payload.last_name);
	formData.append("gender", payload.gender);
	formData.append("date_of_birth", payload.date_of_birth);
	formData.append("country", payload.country);
	formData.append("code", payload.code);
	formData.append("phone_number", payload.phone_number);

	if (payload.profile_picture) {
		formData.append("profile_picture", payload.profile_picture);
	}

	const response = await api.post<AddProfileResponse>(
		"/auth/signup/add-profile/",
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
	return response.data;
};
