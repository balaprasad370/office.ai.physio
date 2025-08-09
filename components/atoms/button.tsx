import { cn } from "@/lib/utils";
import ButtonSvg from "@/components/svg/button-svg";
import React from "react";
import Link from "next/link";

type Props = {
  className?: string;
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  px?: string;
  white?: boolean;
  type?: "button" | "submit" | "reset";
};

const Button = ({ className, href = "", children, onClick, px = "px-7", white = false, type }: Props) => {
  const buttonClasses = cn(
    `button relative inline-flex items-center justify-center h-11`,
    `transition-colors`,
    px,
    "text-n-1",
    className || ""
  );

  const spanClasses = cn("relative z-10");

  const renderButton = () => (
    <button className={buttonClasses} onClick={onClick} type={type}>
      <span className={spanClasses}>{children}</span>
      {ButtonSvg(white)}
    </button>
  );

  const renderLink = () => (
    <Link href={href} className={buttonClasses}>
      <span className={spanClasses}>{children}</span>
      {ButtonSvg(white)}
    </Link>
  );

  return href !== "" ? renderLink() : renderButton();
};

export default Button;
