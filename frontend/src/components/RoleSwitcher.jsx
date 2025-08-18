import React from 'react';
import { createPortal } from 'react-dom';
import { useRole } from './RoleContext.jsx';

export default function RoleSwitcher({ position = 'fixed' }) {
	const { role, setRole } = useRole();
	const [open, setOpen] = React.useState(false);

	const node = (
		<div style={position === 'fixed' ? { position: 'fixed', top: 16, right: 16, zIndex: 14000 } : { position: 'relative' }}>
			<div className="relative">
				<button
					onClick={() => setOpen((s) => !s)}
					className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center text-sm text-white shadow"
					aria-label="Role switcher"
				>
					{role?.[0]?.toUpperCase()}
				</button>
				{open && (
					<div className="absolute right-0 mt-2 w-40 rounded-lg bg-white/90 text-black shadow-lg p-2" style={{ zIndex: 15000 }}>
						<button className="w-full text-left px-3 py-2 rounded hover:bg-black/5" onClick={() => { setRole('student'); setOpen(false); }}>Student</button>
						<button className="w-full text-left px-3 py-2 rounded hover:bg-black/5" onClick={() => { setRole('instructor'); setOpen(false); }}>Instructor</button>
						<button className="w-full text-left px-3 py-2 rounded hover:bg-black/5" onClick={() => { setRole('admin'); setOpen(false); }}>Admin</button>
					</div>
				)}
			</div>
		</div>
	);

	if (position === 'fixed') {
		if (typeof document !== 'undefined') return createPortal(node, document.body);
	}
	return node;
}
