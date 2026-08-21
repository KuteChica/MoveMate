import { Link } from "react-router-dom";

function Footer() {
	return (
		<footer className="border-t border-[#dce9e8] bg-[#eef6f6] px-6 py-10 text-[#617a7c] sm:px-10 lg:px-12">
			<div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
				<div>
					<Link to="/" className="text-base font-black tracking-[-0.04em] text-[#007d7b]">MoveMate</Link>
					<p className="mt-3 text-[10px] leading-5">© 2026 MoveMate Campus Transit.<br />All rights reserved.</p>
				</div>
				<div><h2 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#173c41]">University Links</h2><div className="mt-3 flex flex-col gap-2 text-[10px]"><a href="/#features" className="hover:text-[#007d7b]">Features</a><Link to="/dashboard" className="hover:text-[#007d7b]">Routes</Link><a href="/#how-it-works" className="hover:text-[#007d7b]">How It Works</a></div></div>
				<div><h2 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#173c41]">Support</h2><div className="mt-3 flex flex-col gap-2 text-[10px]"><Link to="/contact" className="hover:text-[#007d7b]">Contact</Link><Link to="/contact" className="hover:text-[#007d7b]">Help</Link></div></div>
				<div><h2 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#173c41]">Legal</h2><div className="mt-3 flex flex-col gap-2 text-[10px]"><a href="#privacy" className="hover:text-[#007d7b]">Privacy Policy</a><a href="#terms" className="hover:text-[#007d7b]">Terms of Service</a></div></div>
			</div>
		</footer>
	);
}

export default Footer;
