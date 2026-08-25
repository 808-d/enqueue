import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { useAppTheme } from "../../contexts/themeContext";

export type FilledTextFieldProps = TextFieldProps;

export default function FilledTextField({
  slotProps,
  sx,
  ...props
}: FilledTextFieldProps) {
  const { catppuccin } = useAppTheme();

  return (
    <TextField
      variant="filled"
      fullWidth
      {...props}
      slotProps={
        {
          ...slotProps,
          inputLabel: {
            sx: { color: catppuccin.subtext1 },
            ...slotProps?.inputLabel,
          },
        } as TextFieldProps["slotProps"]
      }
      sx={[
        {
          "& .MuiInputBase-input": { color: catppuccin.text },
          "& .MuiFilledInput-root": {
            bgcolor: catppuccin.surface0,

            "&:hover": {
              bgcolor: catppuccin.surface1,
            },

            "&.Mui-focused": {
              bgcolor: catppuccin.surface1,
            },

            "&:after": {
              borderBottom: `2px solid ${catppuccin.mauve}`,
            },
          },
        },
        ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
      ]}
    />
  );
}
