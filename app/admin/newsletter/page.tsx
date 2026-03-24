import prisma from "@/lib/prisma";
import { Mail, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const subscribers = await prisma.newsletter.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Newsletter Leads</h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-1">Manage your email marketing subscribers.</p>
        </div>
        
        <Button className="rounded-full bg-zinc-900 hover:bg-[#B59461] text-white font-bold h-10 px-6">
          Export as CSV
        </Button>
      </div>

      <div className="border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
            <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-zinc-300" />
            </div>
            <p className="font-serif text-xl text-zinc-900">No subscribers yet.</p>
            <p className="text-sm text-zinc-400">When people join your newsletter, they will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50/80">
              <TableRow>
                <TableHead className="font-bold text-zinc-500 uppercase tracking-widest text-[10px] h-12 w-[80px]">#</TableHead>
                <TableHead className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Email Address</TableHead>
                <TableHead className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Subscribed On</TableHead>
                <TableHead className="text-right font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((sub: any, index: number) => (
                <TableRow key={sub.id} className="hover:bg-zinc-50/50 transition-colors h-16">
                  <TableCell className="font-bold text-zinc-400 text-xs">
                    {index + 1}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center shrink-0">
                        <Mail className="h-3 w-3 text-zinc-500" />
                      </div>
                      <p className="font-bold text-zinc-900 text-sm">{sub.email}</p>
                    </div>
                  </TableCell>

                  <TableCell className="text-zinc-600 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 font-bold px-3">
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}