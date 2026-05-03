import prisma from "@/lib/prisma";
import { Mail, User, Sparkles, Calendar } from "lucide-react";

export default async function AdminLeadsPage() {
  const leads = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    where: { role: "USER" } 
  });

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-zinc-900">Customer Leads</h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
            People who completed the AI Quiz & Newsletter
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-zinc-100">
          <p className="text-[10px] font-black uppercase text-[#B59461]">Total Leads</p>
          <p className="text-2xl font-bold text-zinc-900">{leads.length}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {leads.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[2rem] border-2 border-dashed border-zinc-200">
            <Mail className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No leads found yet. Start marketing!</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-zinc-200/50 overflow-hidden border border-zinc-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Email Status</th>
                  <th className="px-8 py-5">Joined Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-[#F9F6F0] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#B59461]/10 flex items-center justify-center text-[#B59461]">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{lead.name || "Anonymous"}</p>
                          <p className="text-xs text-zinc-500">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-tighter">
                        <Sparkles className="h-3 w-3" /> Verified Lead
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-zinc-400 hover:text-[#B59461] font-bold text-[10px] uppercase tracking-widest transition-colors">
                        View Ritual
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}