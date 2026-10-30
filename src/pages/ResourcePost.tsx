import { Link, Navigate, useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Button } from "@/components/ui/button";
import { getResourcePost } from "@/data/resourcePosts";

const ResourcePost = () => {
  const { slug } = useParams();
  const post = slug ? getResourcePost(slug) : undefined;
  if (!post) return <Navigate to="/resources" replace />;

  return (
    <div className="landing-page">
      <SEO title={post.title} description={post.description} />
      <LandingHeader />
      <main className="min-h-screen bg-gray-900 text-white">
        <article className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <Link to="/resources" className="text-yellow-400 hover:text-yellow-300 text-sm">
              ← Back to Resources
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-10 leading-tight">{post.title}</h1>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              {post.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-12">
              <Link to="/book-demo">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default ResourcePost;
