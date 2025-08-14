import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Bot, MessageSquare, Search, Shield } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-center">
      <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Bot className="h-12 w-12 text-blue-600" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Search Chatbot
          </h1>
        </div>

        <p className="text-xl text-muted-foreground animate-in fade-in delay-300 duration-700">
          Your intelligent assistant that searches multiple engines to provide comprehensive answers
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Search className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Multi-Engine Search</h3>
            <p className="text-sm text-muted-foreground">
              Searches across Google, Bing, and DuckDuckGo for comprehensive results
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Swift Responses</h3>
            <p className="text-sm text-muted-foreground">
              Get quick, intelligent responses to your queries with chat history
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Secure Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Sign up with email or Google OAuth for a personalized experience
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
