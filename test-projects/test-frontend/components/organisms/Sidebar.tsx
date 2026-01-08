"use client";

import Link from "next/link";
import { Icon } from "@/components/atoms";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const Sidebar = ({
  isOpen,
  onClose,
  activeSection,
  onSectionChange
}: SidebarProps) => {
  const pathname = usePathname();

  const menuItems = [
    { icon: "home" as const, label: "Dashboard", href: "/", section: "dashboard", useContentPane: false },
    { icon: "user" as const, label: "User Management", href: "/users", section: "users", useContentPane: false },
    { icon: "folder" as const, label: "Project Management", href: "/projects", section: "projects", useContentPane: false },
    { icon: "document" as const, label: "Post Management", href: "/posts", section: "posts", useContentPane: false },
    { icon: "shield" as const, label: "Role Management", href: "/roles", section: "roles", useContentPane: false },
    { icon: "cloud" as const, label: "File Management", href: "#", section: "files", useContentPane: true },
  ];

  const isActive = (item: typeof menuItems[0]) => {
    // For content pane items, check activeSection
    if (item.useContentPane && activeSection) {
      return activeSection === item.section;
    }
    // For route-based items, check pathname
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href);
  };

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.useContentPane && onSectionChange) {
      onSectionChange(item.section);
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-500">Sun*</span>
              <span className="text-2xl font-bold text-gray-800">System</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                if (item.useContentPane) {
                  // Render as button for content pane items
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => handleItemClick(item)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item)
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon name={item.icon} size={20} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                }
                // Render as link for route-based items
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => handleItemClick(item)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon name={item.icon} size={20} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};
