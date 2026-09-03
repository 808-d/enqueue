import { Box, Button, Link, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { endpoints } from "../../../utils/endpoints";
import AuthShell from "../../../components/common/authShell";
import FilledTextField from "../../../components/common/filledTextField";
import { useAppTheme } from "../../../contexts/themeContext";

export default function AdminLogin() {
	const { catppuccin } = useAppTheme();

	const [loginState, setLoginState] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState("");

	async function login() {
		setError("");
		try {
			const response = await axios.post(
				endpoints.admin.login,
				{
					username: loginState.username,
					password: loginState.password,
				},
				{
					withCredentials: true,
				},
			);
			if (response.status === 200) {
				window.location.href = "/admin/dashboard";
			}
		} catch (err: any) {
			setError(err.response?.data?.message || "Login failed");
		}
	}

	return (
		<AuthShell>
			<Box
				sx={{
					textAlign: "center",
					mt: 2,
				}}
			>
				<Typography
					variant="h4"
					sx={{
						color: catppuccin.subtext1,
						mt: 1,
					}}
				>
					Admin Panel
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
				onChange={(e) =>
					setLoginState((prev) => ({
						...prev,
						username: e.target.value,
					}))
				}
			/>

			<FilledTextField
				label="Password"
				type="password"
				onChange={(e) =>
					setLoginState((prev) => ({
						...prev,
						password: e.target.value,
					}))
				}
			/>

			<Button
				variant="contained"
				fullWidth
				sx={{
					bgcolor: catppuccin.mauve,
					color: catppuccin.base,
					py: 1.25,
					fontWeight: 700,

					"&:hover": {
						bgcolor: catppuccin.pink,
					},
				}}
				onClick={login}
			>
				Sign In
			</Button>

			<Box sx={{ textAlign: "center", mt: -1 }}>
				<Link
					href="/admin/forgot-password"
					underline="hover"
					sx={{
						color: catppuccin.mauve,
						fontWeight: 600,
						display: "block",
						mt: 1,
					}}
				>
					Forgot password?
				</Link>
			</Box>
		</AuthShell>
	);
}
