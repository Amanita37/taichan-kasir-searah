
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import SupabaseInfoBox from "@/components/SupabaseInfoBox";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Placeholder for Supabase authentication
      console.log("Login with:", { email, password });
      toast({
        title: "Informasi Login",
        description: "Mohon hubungkan ke Supabase untuk fungsi autentikasi.",
      });
      
      // Demo navigation (remove this when Supabase is connected)
      setTimeout(() => {
        navigate("/dashboard");
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat login. Silahkan coba lagi.",
      });
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Placeholder for Supabase authentication
      console.log("Register with:", { email, password });
      toast({
        title: "Informasi Registrasi",
        description: "Mohon hubungkan ke Supabase untuk fungsi registrasi.",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat registrasi. Silahkan coba lagi.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-secondary">
          <span className="text-primary">Taichan</span> Searah
        </h1>
        <p className="text-gray-600">Sistem Manajemen Kasir Indonesia</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <SupabaseInfoBox />

        <Card className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Masukkan kredensial untuk mengakses sistem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark text-secondary-foreground" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>Register</CardTitle>
                  <CardDescription>
                    Buat akun baru untuk mengakses sistem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Register"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="text-center">
          <Button 
            variant="link" 
            onClick={() => navigate("/")}
            className="text-gray-600"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
