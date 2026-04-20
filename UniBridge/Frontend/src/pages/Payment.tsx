import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Download } from "lucide-react";
import paymentService from "@/services/paymentService";

export interface CVFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  careerObjective: string;
  education: string;
  skills: string;
  experience: string;
  certifications: string;
  languages: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cvData: CVFormData = location.state?.cvData;

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the payment page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");

  if (!cvData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No CV Data</CardTitle>
            <CardDescription>
              Please build your CV first before proceeding to payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/cv-builder")} className="w-full">
              Go to CV Builder
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === "card") {
      if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
        toast.error("Please fill in all card details");
        return;
      }
      
      // Basic card validation
      if (cardNumber.replace(/\s/g, '').length < 13 || cardNumber.replace(/\s/g, '').length > 19) {
        toast.error("Please enter a valid card number");
        return;
      }
      
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        toast.error("Please enter expiry date in MM/YY format");
        return;
      }
      
      if (!/^\d{3,4}$/.test(cvv)) {
        toast.error("Please enter a valid CVV");
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      const paymentData = {
        cvData: cvData,
        paymentMethod: paymentMethod,
        cardNumber: cardNumber,
        nameOnCard: nameOnCard,
        expiryDate: expiryDate,
        cvv: cvv,
        amount: 9.99
      };

      const response = await paymentService.processPayment(paymentData);

      if (response.success) {
        toast.success("Payment processing initiated! Your CV will be ready soon.");
        
        // Store payment ID for download
        const paymentId = response.data.paymentId;
        localStorage.setItem('lastPaymentId', paymentId);
        
        // Wait a moment for processing, then download
        setTimeout(async () => {
          try {
            const downloadResponse = await paymentService.downloadCV(paymentId);
            
            // Create download link for PDF file - rebuilt from scratch
            try {
              // Verify we received blob data
              if (!downloadResponse.data) {
                throw new Error('No data received from server');
              }
              
              // Create blob with correct MIME type based on response
              const contentType = downloadResponse.headers && downloadResponse.headers['content-type'] 
                                   ? downloadResponse.headers['content-type'] 
                                   : 'application/pdf';
              
              const isPdf = contentType.includes('application/pdf');
              
              const blob = new Blob([downloadResponse.data], { 
                type: contentType 
              });
              
              // Verify blob was created successfully
              if (blob.size === 0) {
                throw new Error('Empty blob created');
              }
              
              // Create download URL
              const url = window.URL.createObjectURL(blob);
              
              // Create download link element
              const link = document.createElement('a');
              link.style.display = 'none';
              link.href = url;
              
              // Set filename with proper sanitization and correct extension
              const sanitizedName = cvData.fullName
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '_')
                .toLowerCase();
              
              const extension = isPdf ? 'pdf' : 'txt';
              link.download = `${sanitizedName}_CV.${extension}`;
              
              // Trigger download
              document.body.appendChild(link);
              link.click();
              
              // Clean up after download
              setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              }, 100);
              
              console.log(`PDF download initiated: ${link.download} (${blob.size} bytes)`);
              
            } catch (blobError) {
              console.error('Error creating download blob:', blobError);
              throw new Error('Failed to process PDF download');
            }
            
            toast.success("CV downloaded successfully!");
            
            // Redirect to home after successful download
            setTimeout(() => {
              navigate("/");
            }, 2000);
            
          } catch (downloadError) {
            console.error('Download error:', downloadError);
            toast.error("Payment successful, but download failed. Please try downloading from your profile.");
            navigate("/");
          }
        }, 3000); // Wait 3 seconds for processing
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error?.message || error?.details?.message || "Failed to process payment";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateCVDownload = () => {
    // Create a simple text version of the CV for download
    const cvContent = `
CURRICULUM VITAE

Personal Information:
Name: ${cvData.fullName}
Email: ${cvData.email}
Phone: ${cvData.phone}
Address: ${cvData.address}

Career Objective:
${cvData.careerObjective}

Education:
${cvData.education}

Skills:
${cvData.skills}

Experience:
${cvData.experience}
    `.trim();

    // Create a blob and download
    const blob = new Blob([cvContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cvData.fullName.replace(/\s+/g, '_')}_CV.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/cv-builder")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to CV Builder
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CV Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                CV Preview
              </CardTitle>
              <CardDescription>
                This is the CV that will be downloaded after payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{cvData.fullName}</h3>
                <p className="text-sm text-muted-foreground">{cvData.email} | {cvData.phone}</p>
                <p className="text-sm text-muted-foreground">{cvData.address}</p>
              </div>
              
              {cvData.careerObjective && (
                <div>
                  <h4 className="font-medium mb-1">Career Objective</h4>
                  <p className="text-sm">{cvData.careerObjective}</p>
                </div>
              )}
              
              {cvData.education && (
                <div>
                  <h4 className="font-medium mb-1">Education</h4>
                  <p className="text-sm">{cvData.education}</p>
                </div>
              )}
              
              {cvData.skills && (
                <div>
                  <h4 className="font-medium mb-1">Skills</h4>
                  <p className="text-sm">{cvData.skills}</p>
                </div>
              )}
              
              {cvData.experience && (
                <div>
                  <h4 className="font-medium mb-1">Experience</h4>
                  <p className="text-sm">{cvData.experience}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Complete your payment to download the CV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Price Display */}
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Professional CV Download</span>
                    <span className="font-semibold text-lg">$9.99</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">Credit/Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === "card" && (
                  <>
                    <div>
                      <Label htmlFor="nameOnCard">Name on Card</Label>
                      <Input
                        id="nameOnCard"
                        value={nameOnCard}
                        onChange={(e) => setNameOnCard(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Pay $9.99`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your payment information is secure and encrypted
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payment;
