import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Plus, Upload, User, Wallet, LineChart, Check } from "lucide-react";

export default function LendingDashboard() {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ name: "", loan: "" });

  useEffect(() => {
    const stored = localStorage.getItem("clients");
    if (stored) setClients(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients));
  }, [clients]);

  const addClient = () => {
    if (!newClient.name || !newClient.loan) return;
    setClients([
      ...clients,
      {
        id: Date.now(),
        ...newClient,
        payments: 0,
        savings: 0,
        leaderFee: 0,
      },
    ]);
    setNewClient({ name: "", loan: "" });
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").slice(1);
      const parsedClients = rows
        .map((row) => row.split(","))
        .filter((cols) => cols.length >= 2 && cols[0])
        .map(([name, loan]) => ({
          id: Date.now() + Math.random(),
          name: name.trim(),
          loan: parseFloat(loan.trim()),
          payments: 0,
          savings: 0,
          leaderFee: 0,
        }));
      setClients((prev) => [...prev, ...parsedClients]);
    };
    reader.readAsText(file);
  };

  const makeDailyPayment = (id) => {
    const updated = clients.map((client) => {
      if (client.id === id) {
        return {
          ...client,
          payments: client.payments + 100,
          savings: client.savings + 15,
          leaderFee: client.leaderFee + 5,
        };
      }
      return client;
    });
    setClients(updated);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-xl md:text-2xl font-bold mb-4 text-center">Lending Dashboard</h1>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="clients"><User className="h-4 w-4" /> Clients</TabsTrigger>
          <TabsTrigger value="collections"><Wallet className="h-4 w-4" /> Collections</TabsTrigger>
          <TabsTrigger value="savings"><LineChart className="h-4 w-4" /> Savings</TabsTrigger>
          <TabsTrigger value="report"><LineChart className="h-4 w-4" /> Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <Input
                  placeholder="Client Name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                />
                <Input
                  placeholder="Loan Amount (₱)"
                  type="number"
                  value={newClient.loan}
                  onChange={(e) => setNewClient({ ...newClient, loan: e.target.value })}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={addClient} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Add Client
                </Button>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Upload className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Upload CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <Table className="mt-6">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Loan</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Savings</TableCell>
                    <TableCell>Leader Fee</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>₱{client.loan}</TableCell>
                      <TableCell>₱{client.payments}</TableCell>
                      <TableCell>₱{client.savings}</TableCell>
                      <TableCell>₱{client.leaderFee}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <Card>
            <CardContent className="p-4 text-sm text-gray-700">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Pay Today</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => makeDailyPayment(client.id)}>
                          <Check className="w-4 h-4 mr-1" /> Pay ₱120
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings">
          <Card>
            <CardContent className="p-4 text-sm text-gray-700">
              <p>This section will manage C.B.U. savings, withdrawals, and eligibility.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardContent className="p-4 text-sm text-gray-700">
              <p>This section will generate summary reports of income, expenses, and active clients.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
