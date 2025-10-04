import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// Removido supabase para login local

const loginSchema = z.object({
    email: z.string().min(1, { message: "Digite o usuário" }),
    password: z.string().min(1, { message: "Digite a senha" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: LoginForm) {
        setLoading(true);
        // Login local: usuário admin / senha admin
        if (values.email === "admin" && values.password === "admin") {
            toast({
                title: "Login realizado com sucesso!",
                description: "Redirecionando...",
            });
            setTimeout(() => navigate("/"), 1000);
        } else {
            toast({
                title: "Erro ao entrar",
                description: "Usuário ou senha inválidos.",
                variant: "destructive",
            });
        }
        setLoading(false);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
                <h1 className="mb-6 text-3xl font-bold text-center">Entrar</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Usuário</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Usuario" autoComplete="username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Senha" autoComplete="current-password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}