import { useEffect, useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../../../utils/endpoints";
import axios from "axios";
import { useAppTheme } from "../../../contexts/themeContext";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";

type Stats = {
	totalPosts: number;
	totalUsers: number;
	totalComments: number;
	postsOverTime: { date: string; count: number }[];
	usersOverTime: { date: string; count: number }[];
};

type User = {
	id: string;
	username: string;
	email: string;
	role: string;
	createTime: string;
};

type UsersPage = {
	users: User[];
	totalCount: number;
	totalPages: number;
	currentPage: number;
	pageSize: number;
};

export default function AdminDashboard() {
	const { catppuccin } = useAppTheme();
	const navigate = useNavigate();

	const [stats, setStats] = useState<Stats | null>(null);
	const [usersPage, setUsersPage] = useState<UsersPage | null>(null);
	const [activeTab, setActiveTab] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchStats();
	}, []);

	useEffect(() => {
		if (activeTab === 1) {
			fetchUsers(1);
		}
	}, [activeTab]);

	const fetchStats = async () => {
		try {
			const response = await axios.get<Stats>(endpoints.admin.statistics, {
				withCredentials: true,
			});
			setStats(response.data);
		} catch (err: any) {
			setError("Failed to load statistics");
		} finally {
			setLoading(false);
		}
	};

	const fetchUsers = async (page: number) => {
		setLoading(true);
		try {
			const response = await axios.get<UsersPage>(
				`${endpoints.admin.users}?page=${page}&page_size=10`,
				{
					withCredentials: true,
				}
			);
			setUsersPage(response.data);
		} catch (err: any) {
			setError("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await axios.post(endpoints.admin.logout, {}, { withCredentials: true });
			navigate("/admin/login");
		} catch {
			navigate("/admin/login");
		}
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	if (loading && !stats) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
				<Typography>Loading...</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ minHeight: "100vh", bgcolor: catppuccin.base, color: catppuccin.text }}>
			{/* Left Sidebar */}
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
					width: "280px",
					bgcolor: catppuccin.mantle,
					borderRight: `1px solid ${catppuccin.surface1}`,
					position: "fixed",
					left: 0,
					top: 0,
				}}
			>
				<Box sx={{ p: 3, borderBottom: `1px solid ${catppuccin.surface1}` }}>
					<Typography variant="h5" sx={{ fontWeight: 700, color: catppuccin.mauve }}>
						Admin Panel
					</Typography>
				</Box>

				<Tabs
					value={activeTab}
					onChange={(_, v) => setActiveTab(v)}
					orientation="vertical"
					sx={{
						flex: 1,
						borderRight: `1px solid ${catppuccin.surface1}`,
						"& .MuiTab-root": {
							minHeight: 56,
							textTransform: "none",
							fontSize: "1rem",
							fontWeight: 500,
							color: catppuccin.subtext1,
							"&.Mui-selected": {
								color: catppuccin.mauve,
								bgcolor: catppuccin.surface0,
								borderRight: `3px solid ${catppuccin.mauve}`,
							},
						},
					}}
				>
					<Tab
						icon={<DashboardIcon sx={{ mr: 2, fontSize: 22 }} />}
						label="Statistics"
					/>
					<Tab
						icon={<PeopleIcon sx={{ mr: 2, fontSize: 22 }} />}
						label="Users"
					/>
					<	Tab
						icon={<LogoutIcon sx={{ mr: 2, fontSize: 22 }} />}
						label="Logout"
					/>
				</Tabs>
			</Box>

			{/* Main Content */}
			<Box sx={{ ml: "280px", p: 4, minHeight: "100vh" }}>
				{error && (
					<Box
						sx={{
							color: catppuccin.red,
							mb: 3,
							p: 2,
							bgcolor: catppuccin.surface0,
							borderRadius: 2,
							border: `1px solid ${catppuccin.red}`,
						}}
					>
						{error}
					</Box>
				)}

				{activeTab === 0 && stats && (
					<>
						<Typography variant="h4" sx={{ mb: 4, color: catppuccin.subtext1, fontWeight: 700 }}>
							Statistics
						</Typography>

						{/* Stats Cards */}
						<Grid container spacing={3} sx={{ mb: 4 }}>
							<Grid size={{ xs: 12, sm: 6, md: 4 }}>
								<Card sx={{ bgcolor: catppuccin.mantle, border: `1px solid ${catppuccin.surface1}` }}>
									<CardContent>
										<Typography variant="body2" color="textSecondary" gutterBottom>
											Total Posts
										</Typography>
										<Typography variant="h3" sx={{ fontWeight: 700, color: catppuccin.mauve }}>
											{stats.totalPosts.toLocaleString()}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 4 }}>
								<Card sx={{ bgcolor: catppuccin.mantle, border: `1px solid ${catppuccin.surface1}` }}>
									<CardContent>
										<Typography variant="body2" color="textSecondary" gutterBottom>
											Total Users
										</Typography>
										<Typography variant="h3" sx={{ fontWeight: 700, color: catppuccin.green }}>
											{stats.totalUsers.toLocaleString()}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
							<Grid size={{ xs: 12, sm: 6, md: 4 }}>
								<Card sx={{ bgcolor: catppuccin.mantle, border: `1px solid ${catppuccin.surface1}` }}>
									<CardContent>
										<Typography variant="body2" color="textSecondary" gutterBottom>
											Total Comments
										</Typography>
										<Typography variant="h3" sx={{ fontWeight: 700, color: catppuccin.yellow }}>
											{stats.totalComments.toLocaleString()}
										</Typography>
									</CardContent>
								</Card>
							</Grid>
						</Grid>

						{/* Charts */}
						<Grid container spacing={3}>
							<Grid size={{ xs: 12, md: 6 }}>
								<Card sx={{ bgcolor: catppuccin.mantle, border: `1px solid ${catppuccin.surface1}` }}>
									<CardContent>
										<Typography variant="h6" sx={{ mb: 3, color: catppuccin.subtext1 }}>
											Posts (Last 30 Days)
										</Typography>
										<Box sx={{ height: 300 }}>
											<ResponsiveContainer width="100%" height="100%">
												<LineChart data={stats.postsOverTime}>
													<CartesianGrid strokeDasharray="3 3" stroke={catppuccin.surface1} />
													<XAxis dataKey="date" stroke={catppuccin.subtext0} fontSize={12} tick={{ fill: catppuccin.subtext0 }} />
													<YAxis stroke={catppuccin.surface1} tick={{ fill: catppuccin.subtext0, fontSize: 12 }} />
													<RechartsTooltip
														contentStyle={{
															backgroundColor: catppuccin.mantle,
															border: `1px solid ${catppuccin.surface1}`,
															borderRadius: 8,
														}}
													/>
													<Legend />
													<Line
														type="monotone"
														dataKey="count"
														stroke={catppuccin.mauve}
														strokeWidth={2}
														dot={{ fill: catppuccin.mauve, strokeWidth: 2 }}
														activeDot={{ r: 6 }}
													/>
												</LineChart>
											</ResponsiveContainer>
										</Box>
									</CardContent>
								</Card>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<Card sx={{ bgcolor: catppuccin.mantle, border: `1px solid ${catppuccin.surface1}` }}>
									<CardContent>
										<Typography variant="h6" sx={{ mb: 3, color: catppuccin.subtext1 }}>
											Users (Last 30 Days)
										</Typography>
										<Box sx={{ height: 300 }}>
											<ResponsiveContainer width="100%" height="100%">
												<LineChart data={stats.usersOverTime}>
													<CartesianGrid strokeDasharray="3 3" stroke={catppuccin.surface1} />
													<XAxis dataKey="date" stroke={catppuccin.subtext0} fontSize={12} tick={{ fill: catppuccin.subtext0 }} />
													<YAxis stroke={catppuccin.surface1} tick={{ fill: catppuccin.subtext0, fontSize: 12 }} />
													<RechartsTooltip
														contentStyle={{
															backgroundColor: catppuccin.mantle,
															border: `1px solid ${catppuccin.surface1}`,
															borderRadius: 8,
														}}
													/>
													<Legend />
													<Line
														type="monotone"
														dataKey="count"
														stroke={catppuccin.green}
														strokeWidth={2}
														dot={{ fill: catppuccin.green, strokeWidth: 2 }}
														activeDot={{ r: 6 }}
													/>
												</LineChart>
											</ResponsiveContainer>
										</Box>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
					</>
				)}

				{activeTab === 1 && usersPage && (
					<>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
							<Typography variant="h4" sx={{ color: catppuccin.subtext1, fontWeight: 700 }}>
								Users ({usersPage.totalCount})
							</Typography>
						</Box>

						<TableContainer component={Paper} sx={{ bgcolor: catppuccin.mantle, border: `1px solid ${catppuccin.surface1}` }}>
							<Table>
								<TableHead>
									<TableRow sx={{ bgcolor: catppuccin.surface0 }}>
										<TableCell sx={{ color: catppuccin.text }}>Username</TableCell>
										<TableCell sx={{ color: catppuccin.text }}>Email</TableCell>
										<TableCell sx={{ color: catppuccin.text }}>Role</TableCell>
										<TableCell align="right" sx={{ color: catppuccin.text }}>Created</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{usersPage.users.map((user) => (
										<TableRow key={user.id} hover>
											<TableCell sx={{ color: catppuccin.text }}>{user.username}</TableCell>
											<TableCell sx={{ color: catppuccin.text }}>{user.email}</TableCell>
											<TableCell sx={{ color: catppuccin.text }}>{user.role}</TableCell>
											<TableCell align="right" sx={{ color: catppuccin.text }}>{formatDate(user.createTime)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

						{/* Pagination */}
						<Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 3 }}>
							<Button
								variant="outlined"
								disabled={usersPage.currentPage === 1}
								onClick={() => fetchUsers(usersPage.currentPage - 1)}
								sx={{ color: catppuccin.text }}
							>
								Previous
							</Button>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								{Array.from({ length: usersPage.totalPages }, (_, i) => i + 1).map((page) => (
									<Button
										key={page}
										variant={usersPage.currentPage === page ? "contained" : "outlined"}
										onClick={() => fetchUsers(page)}
										sx={{ minWidth: 36, color: catppuccin.text }}
									>
										{page}
									</Button>
								))}
							</Box>
							<Button
								variant="outlined"
								disabled={usersPage.currentPage === usersPage.totalPages}
								onClick={() => fetchUsers(usersPage.currentPage + 1)}
								sx={{ color: catppuccin.text }}
							>
								Next
							</Button>
						</Box>
					</>
				)}

				{activeTab === 2 && (
					<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
						<Typography variant="h5" sx={{ mb: 2, color: catppuccin.subtext1 }}>
							Are you sure you want to logout?
						</Typography>
						<Button
							variant="contained"
							color="error"
							onClick={handleLogout}
							sx={{ px: 4, py: 1.5 }}
						>
							Logout
						</Button>
					</Box>
				)}
			</Box>
		</Box>
	);
}
