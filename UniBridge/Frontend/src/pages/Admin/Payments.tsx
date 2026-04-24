import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Download, 
  Filter,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

interface PaymentData {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  cvData: {
    fullName: string;
    email: string;
    phone: string;
  };
  paymentDetails: {
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    paymentStatus: string;
    cardLastFour: string | null;
    paymentProvider: string;
  };
  downloadInfo: {
    downloadCount: number;
    lastDownloadedAt: string | null;
  };
  createdAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  activeUsers: number;
}

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    activeUsers: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    loadPayments();
  }, [role, navigate]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get("/api/admin/payments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPayments(response.data.data);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to load payments",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      processing: { variant: "secondary", label: "Processing" },
      pending: { variant: "outline", label: "Pending" },
      failed: { variant: "destructive", label: "Failed" },
      refunded: { variant: "secondary", label: "Refunded" },
    };
    const config = statusConfig[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      card: "💳 Card",
      paypal: "🅿️ PayPal",
      stripe: "⚡ Stripe",
    };
    return labels[method] || method;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserName = (payment: PaymentData) => {
    if (payment.userId) {
      return `${payment.userId.firstName} ${payment.userId.lastName}`;
    }
    return payment.cvData?.fullName || "Unknown User";
  };

  const getUserEmail = (payment: PaymentData) => {
    if (payment.userId) {
      return payment.userId.email;
    }
    return payment.cvData?.email || "";
  };

  // Apply filters
  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== "all" && p.paymentDetails.paymentStatus !== statusFilter) return false;
    if (methodFilter !== "all" && p.paymentDetails.paymentMethod !== methodFilter) return false;
    return true;
  });

  const successRate = stats.totalTransactions > 0
    ? Math.round((stats.successfulPayments / stats.totalTransactions) * 100)
    : 0;

  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      toast({ title: "No data", description: "No payments to export", variant: "destructive" });
      return;
    }

    const headers = ["Transaction ID", "User", "Email", "Amount", "Currency", "Method", "Status", "Date"];
    const rows = filteredPayments.map((p) => [
      p.paymentDetails.transactionId,
      getUserName(p),
      getUserEmail(p),
      p.paymentDetails.amount.toFixed(2),
      p.paymentDetails.currency,
      p.paymentDetails.paymentMethod,
      p.paymentDetails.paymentStatus,
      new Date(p.createdAt).toISOString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Exported", description: `${filteredPayments.length} payment(s) exported to CSV` });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Manage and view all payment transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPayments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.successfulPayments} completed payment{stats.successfulPayments !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulPayments}</div>
            <p className="text-xs text-muted-foreground">
              {successRate}% success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users with payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="border rounded-md px-3 py-2 text-sm bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="border rounded-md px-3 py-2 text-sm bg-background"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="card">Card</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>
            {(statusFilter !== "all" || methodFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setMethodFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {filteredPayments.length === payments.length
              ? `Showing all ${payments.length} payment transaction${payments.length !== 1 ? "s" : ""}`
              : `Showing ${filteredPayments.length} of ${payments.length} payment transaction${payments.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading payments...</p>
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {payments.length === 0 ? "No payments yet" : "No matching payments"}
              </h3>
              <p className="text-muted-foreground">
                {payments.length === 0
                  ? "Payment transactions will appear here once users make payments."
                  : "Try adjusting your filters to see more results."}
              </p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Transaction ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Method</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Downloads</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-mono text-xs">
                        {payment.paymentDetails.transactionId}
                      </td>
                      <td className="p-4 align-middle">
                        <div>
                          <div className="font-medium">{getUserName(payment)}</div>
                          <div className="text-xs text-muted-foreground">{getUserEmail(payment)}</div>
                        </div>
                      </td>
                      <td className="p-4 align-middle font-medium">
                        ${payment.paymentDetails.amount.toFixed(2)}
                        <span className="text-xs text-muted-foreground ml-1">
                          {payment.paymentDetails.currency}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-sm">
                        {getMethodLabel(payment.paymentDetails.paymentMethod)}
                        {payment.paymentDetails.cardLastFour && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ••••{payment.paymentDetails.cardLastFour}
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        {getStatusBadge(payment.paymentDetails.paymentStatus)}
                      </td>
                      <td className="p-4 align-middle text-center">
                        {payment.downloadInfo.downloadCount}
                      </td>
                      <td className="p-4 align-middle text-sm text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;