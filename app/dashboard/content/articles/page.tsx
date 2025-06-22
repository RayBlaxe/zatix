"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Article = {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  category: string
  status: "draft" | "published" | "archived"
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  tags: string[]
  featured: boolean
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "1",
      title: "How to Create Successful Events",
      excerpt: "Learn the key strategies for planning and executing memorable events that engage your audience.",
      content: "Full article content here...",
      author: "John Doe",
      category: "Event Planning",
      status: "published",
      publishedAt: "2024-01-15",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-15",
      tags: ["events", "planning", "tips"],
      featured: true,
    },
    {
      id: "2",
      title: "Digital Marketing for Events",
      excerpt: "Discover effective digital marketing strategies to promote your events and increase attendance.",
      content: "Full article content here...",
      author: "Jane Smith",
      category: "Marketing",
      status: "published",
      publishedAt: "2024-01-20",
      createdAt: "2024-01-18",
      updatedAt: "2024-01-20",
      tags: ["marketing", "digital", "promotion"],
      featured: false,
    },
    {
      id: "3",
      title: "Event Technology Trends 2024",
      excerpt: "Explore the latest technology trends that are shaping the future of event management.",
      content: "Full article content here...",
      author: "Mike Johnson",
      category: "Technology",
      status: "draft",
      publishedAt: null,
      createdAt: "2024-01-25",
      updatedAt: "2024-01-25",
      tags: ["technology", "trends", "2024"],
      featured: false,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const categories = ["Event Planning", "Marketing", "Technology", "Business", "Design"]
  const statuses = ["draft", "published", "archived"]

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || article.status === statusFilter
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDelete = (id: string) => {
    setArticles((articles) => articles.filter((article) => article.id !== id))
  }

  const toggleFeatured = (id: string) => {
    setArticles((articles) =>
      articles.map((article) => (article.id === id ? { ...article, featured: !article.featured } : article)),
    )
  }

  const updateStatus = (id: string, status: Article["status"]) => {
    setArticles((articles) =>
      articles.map((article) =>
        article.id === id
          ? {
              ...article,
              status,
              publishedAt: status === "published" ? new Date().toISOString().split("T")[0] : null,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : article,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles Management</h1>
          <p className="text-muted-foreground">Create and manage articles for your website.</p>
        </div>
        <Link href="/dashboard/content/articles/create">
          <Button>
            <Plus className="me-2 size-4" />
            Create Article
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted">
                <span className="text-sm text-muted-foreground">
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <Alert>
            <AlertDescription>
              {articles.length === 0
                ? "No articles found. Create your first article to get started."
                : "No articles match your current filters."}
            </AlertDescription>
          </Alert>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{article.title}</h3>
                      {article.featured && <Badge variant="secondary">Featured</Badge>}
                      <Badge className={getStatusColor(article.status)}>
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>By {article.author}</span>
                      <span>•</span>
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>
                        {article.status === "published" && article.publishedAt
                          ? `Published ${article.publishedAt}`
                          : `Updated ${article.updatedAt}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Select
                      value={article.status}
                      onValueChange={(value) => updateStatus(article.id, value as Article["status"])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => toggleFeatured(article.id)}>
                      <Eye className="size-4" />
                    </Button>
                    <Link href={`/dashboard/content/articles/${article.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="size-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
