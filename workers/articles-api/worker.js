const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      ...corsHeaders,
    },
  });
}

function auth(request, env) {
  const header = request.headers.get("Authorization") || "";
  return (
    env.ADMIN_API_KEY &&
    header === `Bearer ${env.ADMIN_API_KEY}`
  );
}

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname.split("/").filter(Boolean);

    try {

      /*
        PUBLIC API
        /public/articles
      */

      if (
        path[0] === "public" &&
        path[1] === "articles"
      ) {

        if (request.method !== "GET") {
          return json(
            { error: "Method not allowed" },
            405
          );
        }


        // list published articles

        if (path.length === 2) {

          const { results } =
            await env.DB.prepare(`
              SELECT
              id,
              title_ar,
              title_en,
              excerpt_ar,
              excerpt_en,
              author_name,
              category,
              image_url,
              created_at,
              updated_at

              FROM articles

              WHERE status='published'

              ORDER BY created_at DESC
            `)
            .all();


          return json(results);
        }


        // single article

        if (path.length === 3) {

          const article =
            await env.DB.prepare(`
              SELECT *
              FROM articles
              WHERE id=?
              AND status='published'
            `)
            .bind(path[2])
            .first();


          if (!article)
            return json(
              {error:"Article not found"},
             404
            );


          return json(article);
        }
      }



      /*
        ADMIN API
        /articles
      */

      if(path[0]==="articles") {


        if(!auth(request,env)) {

          return json(
            {error:"Unauthorized"},
           401
          );

        }



        // GET ALL

        if(
          path.length===1 &&
          request.method==="GET"
        ){

          const status =
          url.searchParams.get("status");


          const query = status ?

          `
          SELECT *
          FROM articles
          WHERE status=?
          ORDER BY created_at DESC
          `

          :

          `
          SELECT *
          FROM articles
          ORDER BY created_at DESC
          `;


          const stmt =
          env.DB.prepare(query);


          const {results}= status
          ?
          await stmt.bind(status).all()
          :
          await stmt.all();


          return json(results);

        }




        // CREATE

        if(
          path.length===1 &&
          request.method==="POST"
        ){

          const b =
          await request.json();


          if(
            !b.title_ar ||
            !b.content_ar ||
            !b.author_name
          ){

            return json(
              {
                error:
                "title_ar, content_ar and author_name required"
              },
             400
            );

          }



          const result =
          await env.DB.prepare(`
          INSERT INTO articles
          (
          title_ar,
          title_en,
          excerpt_ar,
          excerpt_en,
          content_ar,
          content_en,
          author_name,
          author_email,
          category,
          image_url,
          status
          )

          VALUES
          (?,?,?,?,?,?,?,?,?,?,?)
          `)

          .bind(
          b.title_ar,
          b.title_en || "",
          b.excerpt_ar || "",
          b.excerpt_en || "",
          b.content_ar,
          b.content_en || "",
          b.author_name,
          b.author_email || "",
          b.category || "",
          b.image_url || "",
          b.status || "pending"
          )

          .run();



          return json(
            await env.DB.prepare(
            "SELECT * FROM articles WHERE id=?"
            )
            .bind(result.meta.last_row_id)
            .first(),
            201
          );

        }




        // DELETE

        if(
          path[1] &&
          request.method==="DELETE"
        ){

          await env.DB.prepare(
          "DELETE FROM articles WHERE id=?"
          )
          .bind(path[1])
          .run();


          return json({
            success:true
          });

        }





        // UPDATE

        if(
          path[1] &&
          request.method==="PUT"
        ){

          const b =
          await request.json();


          await env.DB.prepare(`
          UPDATE articles

          SET

          title_ar=?,
          title_en=?,
          excerpt_ar=?,
          excerpt_en=?,
          content_ar=?,
          content_en=?,
          author_name=?,
          author_email=?,
          category=?,
          image_url=?,
          status=?,
          updated_at=CURRENT_TIMESTAMP

          WHERE id=?

          `)

          .bind(
          b.title_ar,
          b.title_en || "",
          b.excerpt_ar || "",
          b.excerpt_en || "",
          b.content_ar,
          b.content_en || "",
          b.author_name,
          b.author_email || "",
          b.category || "",
          b.image_url || "",
          b.status,
          path[1]
          )

          .run();



          return json(
            await env.DB.prepare(
            "SELECT * FROM articles WHERE id=?"
            )
            .bind(path[1])
            .first()
          );

        }




        // CHANGE STATUS

        if(
          path[1] &&
          path[2]==="status" &&
          request.method==="PATCH"
        ){

          const b =
          await request.json();


          await env.DB.prepare(`
          UPDATE articles

          SET status=?,
          updated_at=CURRENT_TIMESTAMP

          WHERE id=?

          `)

          .bind(
          b.status,
          path[1]
          )

          .run();


          return json(
            await env.DB.prepare(
            "SELECT * FROM articles WHERE id=?"
            )
            .bind(path[1])
            .first()
          );

        }


      }



      return json(
        {error:"Not found"},
       404
      );


    }

    catch(error){

      return json(
        {
          error:error.message
        },
       500
      );

    }

  }
};
