"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Check, X, Search } from "lucide-react"

interface Review {
  id: string
  customer: string
  product: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  date: string
}

const initialReviews: Review[] = [
  {
    id: "1",
    customer: "John Doe",
    product: "iPhone 14 Pro",
    rating: 5,
    comment: "Excellent product! Highly recommended.",
    status: "pending",
    date: "2025-01-15",
  },
  {
    id: "2",
    customer: "Jane Smith",
    product: "Macbook Air M4",
    rating: 4,
    comment: "Great laptop, but a bit pricey.",
    status: "approved",
    date: "2025-01-14",
  },
  {
    id: "3",
    customer: "Bob Johnson",
    product: "Apple Watch Ultra",
    rating: 5,
    comment: "Best smartwatch I've ever owned!",
    status: "approved",
    date: "2025-01-13",
  },
  {
    id: "4",
    customer: "Alice Brown",
    product: "MacBook Pro",
    rating: 3,
    comment: "Good product but has some issues.",
    status: "pending",
    date: "2025-01-12",
  },
  {
    id: "5",
    customer: "Charlie Wilson",
    product: "iPad Pro",
    rating: 2,
    comment: "Not worth the price.",
    status: "rejected",
    date: "2025-01-11",
  },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")

  // Filtrer les reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = 
        review.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || review.status === statusFilter
      const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter)

      return matchesSearch && matchesStatus && matchesRating
    })
  }, [reviews, searchQuery, statusFilter, ratingFilter])

  const handleApprove = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, status: "approved" as const } : r
    ))
  }

  const handleReject = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, status: "rejected" as const } : r
    ))
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage customer product reviews</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Reviews</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{review.customer}</p>
                    <p className="text-sm text-muted-foreground">{review.product}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(review.status)}>{review.status}</Badge>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">({review.rating}/5)</span>
                </div>

                <p className="text-sm mb-3">{review.comment}</p>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                  {review.status === "pending" && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleApprove(review.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(review.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {review.status === "approved" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReject(review.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  )}
                  {review.status === "rejected" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApprove(review.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


