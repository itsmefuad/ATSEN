import { Link } from "react-router";
import { CircleUserRoundIcon, MenuIcon } from "lucide-react";

const Navbar = () => {
  return (
    <div className="navbar bg-base-300">
      <div className="flex-none m-4">
        <div className="drawer">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {/* Page content here */}
            <label
              htmlFor="my-drawer"
              className="btn btn-primary drawer-button"
            >
              <MenuIcon className="size-5" />
            </label>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
              {/* Sidebar content here */}
              <li>
                <a>Sidebar Item 1</a>
              </li>
              <li>
                <a>Sidebar Item 2</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {/* <a className="btn btn-ghost text-xl">Teacher's Dashboard</a> */}
        <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">
          Teacher's Dashboard
        </h1>
      </div>

      <div className="flex-none m-4">
        <Link to={"/teacher/dashboard"} className="btn btn-Neutral">
          <CircleUserRoundIcon className="size-5" />
          <span>Profile</span>{" "}
        </Link>
      </div>
    </div>
    // <header className="bg-base-300 border-base-content/10">
    //   <div className="mx-auto p-4">
    //     <div className="flex justify-between">
    //       <div className="flex items-center gap-4">
    //         <MenuIcon className="size-5" />
    //       </div>
    //       <div className="flex items-center">
    //         <Link to={"/teacher/classroom/:id"} className="btn btn-Neutral">
    //           <CircleUserRoundIcon className="size-5" />
    //           <span>Profile</span>
    //         </Link>
    //       </div>
    //     </div>
    //   </div>
    // </header>
  );
};

export default Navbar;
