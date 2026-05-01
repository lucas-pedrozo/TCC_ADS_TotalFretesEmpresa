import { SidebarTrigger } from "@/components/ui/sidebar";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

type HeaderProps = {
  title?: string;
}

const Header = (props: HeaderProps) => {

  const { logout } = useAuth();

  return (
    <header className="flex-1 flex-row justify-between items-center gap-3 p-5">
      <div className="">
        <SidebarTrigger />
        <p>{props.title}</p>
      </div>
      <div className="">
        <button className="bg-black/20 p-1.5 rounded-full" onClick={logout}>
          <FiLogOut />
        </button>
      </div>
    </header>
  )
}

export default Header;