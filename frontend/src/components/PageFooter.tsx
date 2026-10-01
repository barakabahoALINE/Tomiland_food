import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const exploreLinks = [
  ['Shop Fresh Food', '/products'],
  ['Smart Basket', '/basket'],
  ['Local Markets', '/markets'],
  ['Supermarkets', '/supermarkets'],
]

const customerCareLinks = [
  ['Help Center', '/how-it-works'],
  ['How it Works', '/how-it-works'],
  ['Delivery & Pickup', '/how-it-works'],
  ['Returns & Refunds', '/how-it-works'],
  ['Contact Us', '/how-it-works'],
]

const companyLinks = [
  ['About Us', '/how-it-works'],
  ['Careers', '/how-it-works'],
  ['Become a Partner', '/how-it-works'],
  ['Terms & Conditions', '/how-it-works'],
  ['Privacy Policy', '/how-it-works'],
]

export default function PageFooter() {
  return (
    <footer className="mt-12 border-t border-[#e7e1d9] bg-white text-[#1e2a22]">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))] lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={logo} alt="Tomiland Foods logo" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-sm font-black tracking-[-0.03em] text-[#2f7a4f]">Tomiland Foods</span>
          </Link>
          <p className="mt-3 max-w-[190px] text-xs leading-5 text-[#5a6762]">Good Food. Local Choices. Delivered.</p>
          <div className="mt-4 flex gap-3 text-xs font-bold text-[#52645a]" aria-label="Social media links">
            <a href="#facebook" aria-label="Facebook" className="hover:text-[#2f7a4f]">f</a>
            <a href="#instagram" aria-label="Instagram" className="hover:text-[#2f7a4f]">◎</a>
            <a href="#twitter" aria-label="X" className="hover:text-[#2f7a4f]">𝕏</a>
            <a href="#youtube" aria-label="YouTube" className="hover:text-[#2f7a4f]">▶</a>
          </div>
        </div>

        <FooterLinkGroup title="Explore" links={exploreLinks} />
        <FooterLinkGroup title="Customer Care" links={customerCareLinks} />
        <FooterLinkGroup title="Company" links={companyLinks} />

        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-black text-[#1e2a22]">Download the App</p>
          <p className="mt-2 max-w-[190px] text-xs leading-5 text-[#5a6762]">Get the full Tomiland experience on the go.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="#google-play" className="rounded-md bg-[#1e2a22] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#2f7a4f]">Google Play</a>
            <a href="#app-store" className="rounded-md bg-[#1e2a22] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#2f7a4f]">App Store</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#edf0ed] px-6 py-3 text-center text-[10px] text-[#7b8781]">
        © 2025 Tomiland Foods. All rights reserved.
      </div>
    </footer>
  )
}

function FooterLinkGroup({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="text-xs font-black text-[#1e2a22]">{title}</p>
      <div className="mt-3 space-y-1.5">
        {links.map(([label, path]) => (
          <Link key={label} to={path} className="block text-[11px] text-[#5a6762] hover:text-[#2f7a4f]">
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
