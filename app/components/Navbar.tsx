// @flow
import * as React from 'react';
import {Link} from "react-router/internal/react-server-client";

type Props = {

};
export const Navbar = (props: Props) => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>
            <Link to="/upload" className="primary-button w-fit">
                Upload Resume
            </Link>
        </nav>
    );
};