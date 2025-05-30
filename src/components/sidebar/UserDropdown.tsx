
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function UserDropdown() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Close dropdown after clicking an item on mobile
  const handleItemClick = () => {
    if (isMobile) {
      setTimeout(() => setOpen(false), 100);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="User Avatar" />
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-white border border-gray-200 shadow-md"
        sideOffset={isMobile ? 8 : 4}
        avoidCollisions={false}
      >
        <DropdownMenuItem className="cursor-pointer" onClick={handleItemClick}>
          <Link to="/settings" className="flex w-full justify-between">
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleItemClick}>
          <Link to="/print" className="flex w-full">
            Print View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer p-0">
          <LogoutButton className="w-full justify-between p-2 h-auto font-normal hover:bg-transparent">
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </LogoutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
