import { Box, Button, Link, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { endpoints } from "../../../utils/endpoints";
import AuthShell from "../../../components/common/authShell";
import FilledTextField from "../../../components/common/filledTextField";
import { useAppTheme } from "../../../contexts/themeContext";
import { useNavigate } from "react-router-dom";

export default function AdminForgotPassword() {
	const { catppuccin } = useAppTheme();
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		try {
			await axios.post(
				endpoints.admin.forgotPassword,
				{ username },
				{ withCredentials: true }
			);
			setSubmitted(true);
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to send reset email");
		}
	}

	if (submitted) {
		return (
			<AuthShell>
				<Box sx={{ textAlign: "center", mt: 2 }}>
					<Typography variant="h4" sx={{ color: catppuccin.subtext1, mb: 2 }}>
						Check your email
					</Typography>
					<Typography sx={{ color: catppuccin.subtext0, mb: 3 }}>
						If an account with that username exists, a password reset link has been sent.
					</Typography>
					<Button
						variant="contained"
						onClick={() => navigate("/admin/login")}
						sx={{
							bgcolor: catppuccin.mauve,
							color: catppuccin.base,
							py: 1.25,
							fontWeight: 700,
							"&:hover": { bgcolor: catppuccin.pink },
						}}
					>
						Back to Login
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
						Admin Panel - Reset Password
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
					label="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>

				<Button
					type="submit"
					variant="contained"
					fullWidth
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
					Send Reset Link
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
