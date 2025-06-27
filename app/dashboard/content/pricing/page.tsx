"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, MoveUp, MoveDown, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type PricingPlan = {
  id: string
  name: string
  description: string
  price: string
  period: string
  features: string[]
  popular: boolean
  active: boolean
  order: number
  buttonText: string
  buttonLink: string
}

export default function PricingContentPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([
    {
      id: "1",
      name: "Free",
      description: "Perfect for getting started",
      price: "0",
      period: "month",
      features: ["1 Event", "10 Participants", "Basic Support", "Email Notifications"],
      popular: false,
      active: true,
      order: 1,
      buttonText: "Get Started",
      buttonLink: "/register",
    },
    {
      id: "2",
      name: "Pro",
      description: "Best for growing businesses",
      price: "29",
      period: "month",
      features: ["Unlimited Events", "500 Participants", "Priority Support", "Advanced Analytics", "Custom Branding"],
      popular: true,
      active: true,
      order: 2,
      buttonText: "Start Free Trial",
      buttonLink: "/register",
    },
    {
      id: "3",
      name: "Enterprise",
      description: "For large organizations",
      price: "99",
      period: "month",
      features: ["Unlimited Everything", "Dedicated Support", "Custom Integrations", "White Label", "SLA"],
      popular: false,
      active: true,
      order: 3,
      buttonText: "Contact Sales",
      buttonLink: "/contact",
    },
  ])

  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    period: "month",
    features: "",
    popular: false,
    buttonText: "",
    buttonLink: "",
  })

  const handleCreate = () => {
    setEditingPlan(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      period: "month",
      features: "",
      popular: false,
      buttonText: "",
      buttonLink: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      period: plan.period,
      features: plan.features.join("\n"),
      popular: plan.popular,
      buttonText: plan.buttonText,
      buttonLink: plan.buttonLink,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const features = formData.features.split("\n").filter((f) => f.trim() !== "")

    if (editingPlan) {
      setPricingPlans((plans) =>
        plans.map((plan) => (plan.id === editingPlan.id ? { ...plan, ...formData, features } : plan)),
      )
    } else {
      const newPlan: PricingPlan = {
        id: Date.now().toString(),
        ...formData,
        features,
        active: true,
        order: pricingPlans.length + 1,
      }
      setPricingPlans((plans) => [...plans, newPlan])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setPricingPlans((plans) => plans.filter((plan) => plan.id !== id))
  }

  const toggleActive = (id: string) => {
    setPricingPlans((plans) => plans.map((plan) => (plan.id === id ? { ...plan, active: !plan.active } : plan)))
  }

  const togglePopular = (id: string) => {
    setPricingPlans((plans) => plans.map((plan) => (plan.id === id ? { ...plan, popular: !plan.popular } : plan)))
  }

  const moveUp = (id: string) => {
    setPricingPlans((plans) => {
      const index = plans.findIndex((p) => p.id === id)
      if (index > 0) {
        const newPlans = [...plans]
        ;[newPlans[index - 1], newPlans[index]] = [newPlans[index], newPlans[index - 1]]
        return newPlans.map((plan, i) => ({ ...plan, order: i + 1 }))
      }
      return plans
    })
  }

  const moveDown = (id: string) => {
    setPricingPlans((plans) => {
      const index = plans.findIndex((p) => p.id === id)
      if (index < plans.length - 1) {
        const newPlans = [...plans]
        ;[newPlans[index], newPlans[index + 1]] = [newPlans[index + 1], newPlans[index]]
        return newPlans.map((plan, i) => ({ ...plan, order: i + 1 }))
      }
      return plans
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground">Manage pricing plans and their features.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 size-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Pricing Plan" : "Add New Pricing Plan"}</DialogTitle>
              <DialogDescription>
                {editingPlan ? "Update the pricing plan details." : "Create a new pricing plan."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Best for growing businesses"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g., 29"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Input
                    id="period"
                    value={formData.period}
                    onChange={(e) => setFormData((prev) => ({ ...prev, period: e.target.value }))}
                    placeholder="e.g., month"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData((prev) => ({ ...prev, features: e.target.value }))}
                  placeholder="Unlimited Events&#10;500 Participants&#10;Priority Support"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="e.g., Get Started"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData((prev) => ({ ...prev, buttonLink: e.target.value }))}
                    placeholder="e.g., /register"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="popular"
                  checked={formData.popular}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, popular: checked }))}
                />
                <Label htmlFor="popular">Mark as Popular</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>
                {editingPlan ? "Update" : "Create"} Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pricingPlans.length === 0 ? (
          <div className="col-span-full">
            <Alert>
              <AlertDescription>No pricing plans found. Create your first plan to get started.</AlertDescription>
            </Alert>
          </div>
        ) : (
          pricingPlans
            .sort((a, b) => a.order - b.order)
            .map((plan, index) => (
              <Card key={plan.id} className={`relative ${plan.popular ? "ring-2 ring-primary" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${plan.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {plan.active ? "Active" : "Inactive"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => moveUp(plan.id)} disabled={index === 0}>
                        <MoveUp className="size-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveDown(plan.id)}
                        disabled={index === pricingPlans.length - 1}
                      >
                        <MoveDown className="size-3" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.buttonText}
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleActive(plan.id)} className="flex-1">
                        {plan.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => togglePopular(plan.id)} className="flex-1">
                        {plan.popular ? "Unmark" : "Mark"} Popular
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(plan)} className="flex-1">
                        <Edit className="size-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(plan.id)} className="flex-1">
                        <Trash2 className="size-4 mr-1" />
                        Delete
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
