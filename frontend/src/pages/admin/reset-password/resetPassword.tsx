import { Box, Button, Link, Typography } from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { endpoints } from "../../../utils/endpoints";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthShell from "../../../components/common/authShell";
import FilledTextField from "../../../components/common/filledTextField";
import { useAppTheme } from "../../../contexts/themeContext";

export default function AdminResetPassword() {
	const { catppuccin } = useAppTheme();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!token) {
			setError("Invalid or missing reset token");
		}
	}, [token]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		if (!token) {
			setError("Invalid or missing reset token");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		setLoading(true);
		setError("");

		try {
			await axios.post(
				endpoints.admin.resetPassword,
				{ token, newPassword: password },
				{ withCredentials: true }
			);
			setSubmitted(true);
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	}

	if (!token) {
		return (
			<AuthShell>
				<Box sx={{ textAlign: "center", mt: 2 }}>
					<Typography variant="h4" sx={{ color: catppuccin.subtext1, mb: 2 }}>
						Invalid Link
					</Typography>
					<Typography sx={{ color: catppuccin.subtext0, mb: 3 }}>
						The password reset link is invalid or has expired.
					</Typography>
					<Button
						variant="contained"
						onClick={() => navigate("/admin/login")}
						sx={{
							bgcolor: catppuccin.mauve,
							color: catppuccin.base,
							py: 1.25,
							fontWeight: 700,
						}}
					>
						Back to Login
					</Button>
				</Box>
			</AuthShell>
		);
	}

	if (submitted) {
		return (
			<AuthShell>
				<Box sx={{ textAlign: "center", mt: 2 }}>
					<Typography variant="h4" sx={{ color: catppuccin.green, mb: 2 }}>
						Password Reset Successfully
					</Typography>
					<Typography sx={{ color: catppuccin.subtext0, mb: 3 }}>
						Your password has been reset. You can now log in with your new password.
					</Typography>
					<Button
						variant="contained"
						onClick={() => navigate("/admin/login")}
						sx={{
							bgcolor: catppuccin.mauve,
							color: catppuccin.base,
							py: 1.25,
							fontWeight: 700,
						}}
					>
						Login Now
					</Button>
				</Box>
			</AuthShell>
		);
	}

	return (
		<AuthShell>
			<form onSubmit={handleSubmit}>
				<Box sx={{ textAlign: "center", mt: 2 }}>
					<Typography
						variant="h4"
						sx={{
							color: catppuccin.subtext1,
							mt: 1,
						}}
					>
						Reset Admin Password
					</Typography>
				</Box>

				{error && (
					<Box
						sx={{
							color: catppuccin.red,
							mb: 2,
							fontSize: "0.875rem",
						}}
					>
						{error}
					</Box>
				)}

				<FilledTextField
					label="New Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<FilledTextField
					label="Confirm Password"
					type="password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>

				<Button
					type="submit"
					variant="contained"
					fullWidth
					disabled={loading}
					sx={{
						bgcolor: catppuccin.mauve,
						color: catppuccin.base,
						py: 1.25,
						fontWeight: 700,
						mt: 2,
						"&:hover": {
							bgcolor: catppuccin.pink,
						},
					}}
				>
					{loading ? "Resetting..." : "Reset Password"}
				</Button>

				<Box sx={{ textAlign: "center", mt: 2 }}>
					<Link
						href="/admin/login"
						underline="hover"
						sx={{
							color: catppuccin.mauve,
							fontWeight: 600,
						}}
					>
						Back to Login
					</Link>
				</Box>
			</form>
		</AuthShell>
	);
}
