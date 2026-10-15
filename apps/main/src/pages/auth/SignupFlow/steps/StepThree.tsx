import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useSignupStore } from "../../../../store/useSignupStore";
import { signupWithEmail } from "../../../../services/auth.service";

interface StepThreeProps {
	onNext: () => void;
	onBack: () => void;
}

const StepThree: React.FC<StepThreeProps> = ({ onNext, onBack }) => {
	const {
		email: storedEmail,
		userType,
		setEmail: storeEmail,
		setSignupToken,
		setResendAfterSeconds,
		isLoading,
		setLoading,
		error,
		setError,
		clearError,
	} = useSignupStore();

	// Restore email from store if it exists (for persistence across refresh)
	const [email, setEmail] = useState(storedEmail || "");
	// const [password, setPassword] = useState("");
	// const [showPassword, setShowPassword] = useState(false);

	const handleContinue = async () => {
		if (!email || !userType) return;

		clearError();
		setLoading(true);

		try {
			const response = await signupWithEmail({
				email,
				user_type: userType,
			});

			// Store email for the verify step
			storeEmail(email);

			// Store the OTP code for display in StepFour
			const otp =
				response.otp_code ??
				(response.token != null ? String(response.token) : null);
			if (otp) {
				setSignupToken(otp);
			}

			// Store the resend cooldown so StepFour can start its timer
			const resendAfter =
				response.info && typeof response.info === "object"
					? response.info.resend_after_seconds
					: 60;
			setResendAfterSeconds(resendAfter);

			// Password is held locally — will be sent in StepFive
			// Store it temporarily in sessionStorage so StepFive can use it
			// sessionStorage.setItem("signup_password", password);

			console.log("Signup email response:", response.message);
			onNext();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			setError(
				err.message || "Failed to send verification email. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	// const isValid = email.length > 0 && password.length > 0;

	return (
		<div className="flex flex-col h-full">
			<button
				onClick={onBack}
				className="flex items-center gap-2 text-gray-700 mb-6 hover:text-gray-900 transition w-fit"
				aria-label="Go back"
			>
				<ArrowLeft size={20} />
				<span>Back</span>
			</button>

			<h1 className="text-3xl font-bold mb-8">
				Welcome! How would you like to join?
			</h1>

			{error && (
				<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
					{error}
				</div>
			)}

			<div className="space-y-6 mb-8">
				{/* Email Field */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Email
					</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your Email"
						className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6A0DAD] focus:border-transparent"
						disabled={isLoading}
					/>
				</div>

				{/* Password Field */}
				{/* <div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Password
					</label>
					<div className="relative">
						<input
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your Password"
							className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6A0DAD] focus:border-transparent pr-12"
							disabled={isLoading}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
				</div> */}
			</div>

			<button
				onClick={handleContinue}
				disabled={isLoading}
				className={`w-full py-4 rounded-full font-semibold transition-all mb-4 flex items-center justify-center gap-2 ${
					!isLoading
						? "bg-[#6A0DAD] text-white hover:bg-[#5a0b92] cursor-pointer"
						: "bg-gray-200 text-gray-400 cursor-not-allowed"
				}`}
			>
				{isLoading && <Loader2 size={18} className="animate-spin" />}
				{isLoading ? "Sending verification..." : "Continue"}
			</button>

			<p className="text-center text-sm text-gray-600">
				Already have an account?{" "}
				<button className="text-[#6A0DAD] font-semibold hover:underline">
					Sign in
				</button>
			</p>
		</div>
	);
};

export default StepThree;
