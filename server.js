/*********************************************************************************
 *  WEB322 – Assignment 5
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: Tanmay Goyal 
 *  Student ID: 132737248
 ********************************************************************************/

const express = require("express");
const projectData = require("./modules/projects");
const path = require("path");
const app = express();

const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home", { page: "/" });
});

app.get("/about", (req, res) => {
  res.render("about", { page: "/about" });
});

app.get("/solutions/projects", (req, res) => {
  const sector = req.query.sector;

  if (sector) {
    projectData
      .getProjectsBySector(sector)
      .then((projects) =>
        res.render("projects", { projects, page: "/solutions/projects" })
      )
      .catch(() =>
        res.status(404).render("404", {
          message: `No projects found for sector: ${sector}`,
          page: "/solutions/projects",
        })
      );
  } else {
    projectData
      .getAllProjects()
      .then((projects) =>
        res.render("projects", { projects, page: "/solutions/projects" })
      )
      .catch(() =>
        res.status(404).render("404", {
          message: "Unable to load projects.",
          page: "/solutions/projects",
        })
      );
  }
});

app.get("/solutions/projects/:id", (req, res) => {
  const projectId = parseInt(req.params.id);

  projectData
    .getProjectById(projectId)
    .then((project) =>
      res.render("project", { project, page: "/solutions/projects" })
    )
    .catch(() =>
      res.status(404).render("404", {
        message: `No project found with ID: ${req.params.id}`,
        page: "/solutions/projects",
      })
    );
});

app.get("/solutions/addProject", (req, res) => {
  projectData
    .getAllSectors()
    .then((sectorData) => {
      res.render("addProject", {
        sectors: sectorData,
        page: "/solutions/addProject",
      });
    })
    .catch((err) => {
      res.render("500", { message: `Error loading sectors: ${err}` });
    });
});

app.post("/solutions/addProject", (req, res) => {
  projectData
    .addProject(req.body)
    .then(() => res.redirect("/solutions/projects"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/solutions/editProject/:id", (req, res) => {
  const projectId = req.params.id;

  Promise.all([
    projectData.getProjectById(projectId),
    projectData.getAllSectors(),
  ])
    .then(([project, sectors]) => {
      res.render("editProject", { project, sectors });
    })
    .catch((err) => {
      res.status(404).render("404", {
        message: `Error loading project or sectors: ${err}`,
        page: "",
      });
    });
});

app.post("/solutions/editProject", (req, res) => {
  const id = req.body.id;

  projectData
    .editProject(id, req.body)
    .then(() => res.redirect("/solutions/projects"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/solutions/deleteProject/:id", (req, res) => {
  const projectId = parseInt(req.params.id);

  projectData
    .deleteProject(projectId)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.use((req, res) => {
  res.status(404).render("404", {
    message: "Sorry, the page you're looking for doesn't exist.",
    page: "",
  });
});

projectData
  .initialize()
  .then(() => {
    console.log("Project data initialized successfully.");
    app.listen(PORT, () => console.log("Server is running on port " + PORT));
  })
  .catch((error) => {
    console.log("Failed to initialize project data:", error);
  });
