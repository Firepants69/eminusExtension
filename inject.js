
const htmlNavbar =
    `
<style>
    .border-default {
        border-bottom: 3px solid white; /* Borde inicial blanco */
        transition: border-color 0.1s ease-in-out;
    }

    .border-select {
        border-bottom: 3px solid purple;
    }

    .border-hover:hover {
        cursor: pointer;
        border-bottom-color: purple; /* Cambio a morado en hover */
    }

    .navbar-nav {
        display: grid;
        grid-template-columns: repeat(3, 1fr); /* 3 columnas iguales */
        gap: 10px; /* Espaciado entre elementos */
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    .navbar-item {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center
        padding: 1px;
    }
</style>

<div class="bg-white container-fluid pb-1 pt-4 rounded-pill shadow-sm">
    <ul class="navbar-nav">
        <li id="tareas-pendientes" class="navbar-item border-select">
            <i class="mx-1 material-icons">assignment</i>
            <p class="mx-1 font-weight-bold text-dark" id="numero-tareas">??</p>  
        </li>
        <li id="examenes-pendientes" class="navbar-item border-default border-hover">
            <i class="material-icons">book</i>
            <p class="mx-1 font-weight-bold text-dark" id="numero-examenes">??</p>
        </li>
        <li id="foros-pendientes" class="navbar-item border-default border-hover">
            <i class="material-icons">forum</i>
            <p class="mx-1 font-weight-bold text-dark" id="numero-foros">??</p>
        </li>
    </ul>
</div>

`;

var info = {};

const getAsyncCourses = async (token) => {
    const url = 'https://eminus.uv.mx/eminusapi/api/Cursos/getAllCourses';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token} `,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los cursos');
        }

        const data = await response.json();
        console.log(data);

        const newCourses = data.filter(course => new Date(course.curso.fechaTermino) > new Date());

        info.courses = newCourses;

        return newCourses;
    } catch (error) {
        console.error('Error al hacer la solicitud:', error);
    }
};

const getActivitiesForCourseAsync = async (token, courseId) => {
    const url = `/eminusapi/api/Actividad/getActividadesEstudiante/${courseId} `
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token} `,
            },
        })

        if (!response.ok) {
            throw new Error('Error al obtener las actividades');
        }
        const data = await response.json();
        console.log(data);
        const newActivities = data.filter(activity => new Date(activity?.fechaTermino) > new Date());
        return newActivities;
    } catch (error) {
        console.log(error)
        return [];
    }
}


const getForumsForCourseAsync = async (token, courseId) => {
    const url = `/eminusapi/api/Foro/getForos/${courseId}/0`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Error al obtener las actividades');
        }
        const data = await response.json();

        return data;

    } catch (error) {
        return [];
    }
}

const getExamsForCourseAsync = async (token, courseId) => {
    const url = `/eminusapi/api/Examen/getExamenesEst/${courseId}`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error('Error al obtener las actividades');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return [];
    }
}

const getAllActivies = async (token) => {
    try {
        var courses;

        if (info.courses != undefined) {
            courses = info.courses
        } else {
            courses = await getAsyncCourses(token);
        }
        let activities = []
        if (info.activities != undefined) {

            return info.activities;

        }
        else {
            for (const course of courses) {
                const courseActivie = await getActivitiesForCourseAsync(token, course?.curso?.idCurso);

                const newCouserActivie = courseActivie.map(activity => ({ ...activity, course_title: course?.curso?.nombre }))

                activities.push(...newCouserActivie);
            }

            const pendingactivities = [
                ...activities
                    .filter(info => !info.estadoEntrega)
                    .sort((a, b) => new Date(a.fechaTermino) - new Date(b.fechaTermino))
                , ...activities.filter(info => info.estadoEntrega == 1)
            ];
            info.activities = pendingactivities;
            console.log("actividades", info.activities);
            return pendingactivities;
        }
    } catch {
        return [];
    }
}

const allForumsAsync = async (token) => {
    try {
        var courses;

        if (info.courses != undefined) {
            courses = info.courses
        } else {
            courses = await getAsyncCourses(token);
        }

        if (info.forums != undefined) {

            return info.forums;

        }
        else {
            let forums = []
            for (const course of courses) {
                const courseForums = await getForumsForCourseAsync(token, course?.curso?.idCurso);
                const newForums = courseForums.map(forum => ({ ...forum, nombre_curso: course?.curso?.nombre }))
                forums.push(...newForums);
            }

            info.forums = forums;

            return forums;
        }
    } catch {
        return [];
    }
}

const allExamsAsync = async (token) => {
    try {
        var courses;

        if (info.exams != undefined) {
            return info.exams;
        }

        if (info.courses != undefined) {
            courses = info.courses
        } else {
            courses = await getAsyncCourses(token);
        }

        let exams = []
        for (const course of courses) {
            const courseExams = await getExamsForCourseAsync(token, course?.curso?.idCurso);
            const newExams = courseExams.map(exam =>
                ({ ...exam, nombre_curso: course?.curso?.nombre, idCurso: course?.curso?.idCurso }));

            exams.push(...newExams);
        }

        info.exams = exams;

        return exams;
    } catch {
        return [];
    }
}


const onClickActivity = (courseId, activityId) => {
    const config = {
        config: {
            demo: "default",
            navegation: {
                course: {
                    id: courseId,
                    permission: 2,
                    unit: 0,
                    activity: activityId,
                    forum: 0,
                    exam: 0,
                    view_student: false,
                    type: 2
                },
                forum: {
                    comment: 0
                },
                member: {
                    user: ""
                },
                tracing: {
                    user: ""
                },
                exam: {
                    id: "",
                    ending: ""
                }
            }
        }
    };
    localStorage.setItem('layoutConfigNavegation', JSON.stringify(config));
    localStorage.setItem('changeActivityId', activityId);
    localStorage.setItem('TypeCourse', "Normal");
    window.location.assign('https://eminus.uv.mx/eminus4/page/course/activity/delivery');
}

const onClickForum = (courseId, forumId) => {
    const config = {
        config: {
            demo: "default",
            navegation: {
                course: {
                    id: courseId,
                    permission: 2,
                    unit: 0,
                    activity: 0,
                    forum: forumId,
                    exam: 0,
                    view_student: false,
                    type: 2
                },
                forum: {
                    comment: 0
                },
                member: {
                    user: ""
                },
                tracing: {
                    user: ""
                },
                exam: {
                    id: "",
                    ending: ""
                }
            }
        }
    };
    localStorage.setItem('layoutConfigNavegation', JSON.stringify(config));
    localStorage.setItem('TypeCourse', "Normal");
    window.location.assign('https://eminus.uv.mx/eminus4/page/course/forum/view');
}

const onClickExam = (courseId, examId) => {
    const config = {
        config: {
            demo: "default",
            navegation: {
                course: {
                    id: courseId,
                    permission: 2,
                    unit: 0,
                    activity: 0,
                    forum: 0,
                    exam: 0,
                    view_student: false,
                    type: 1
                },
                forum: {
                    comment: 0
                },
                member: {
                    user: ""
                },
                tracing: {
                    user: ""
                },
                exam: {
                    id: examId,
                    ending: ""
                }
            }
        }
    };
    localStorage.setItem('layoutConfigNavegation', JSON.stringify(config));
    localStorage.setItem('TypeCourse', "Normal");
    localStorage.setItem('courseId', courseId);
    window.location.assign('https://eminus.uv.mx/eminus4/page/course/exam/student/preview');
}


// select the div 
const init = (principalDiv, favs) => {
    const token = localStorage.getItem('accessToken');

    const style = document.createElement('style');
    style.innerHTML = `
            .principal {
                color: black;
                display: flex;
                justify-content: start; 
                align-items: start;
                flex-direction: column;
                padding: 8px;
            }
    
            .loader-div {
                color: black;
                display: flex;
                justify-content: center; 
                align-items: center;
                flex-direction: column;
                padding: 15px;
            }
            .
            .title-activity{
               
                color: black;
            }
            .title-activity:hover {
                color: #575656;
            }

            .title-activity-alert{
               
                color: red;
            }
            .title-activity-alert:hover {
                color:#EE6666;
            }

            .loader {
            width: 50px;
            padding: 8px;
            aspect-ratio: 1;
            border-radius: 50%;
            background: rgb(13, 71, 161);
            --_m: 
                conic-gradient(#0000 10%,#000),
                linear-gradient(#000 0 0) content-box;
            -webkit-mask: var(--_m);
                    mask: var(--_m);
            -webkit-mask-composite: source-out;
                    mask-composite: subtract;
            animation: l3 1s infinite linear;
            }
            @keyframes l3 {to{transform: rotate(1turn)}}
        `;
    // add style to head
    document.head.appendChild(style);


    principalDiv.classList.add('principal');
    principalDiv.style.marginBottom = "20px"

    showActivities(token, principalDiv);

    favs.appendChild(principalDiv);

};

const showActivities = (token, principalDiv) => {
    const loadingDiv = document.createElement('div')
    loadingDiv.classList.add('loader-div');

    loadingDiv.style.minHeight = "73vh";
    loadingDiv.style.maxHeight = "73vh";
    loadingDiv.style.width = "100%";

    const loading = document.createElement('div')

    loading.classList.add('loader');


    principalDiv.appendChild(loadingDiv);
    loadingDiv.appendChild(loading);

    let activitiesDiv;

    if (document.getElementById('div-contenido') != null) {
        activitiesDiv = document.getElementById('div-contenido')
    } else {
        activitiesDiv = document.createElement('div');
        activitiesDiv.id = "div-contenido";
    }


    getAllActivies(token).then((data) => {
        if (data.length === 0) {
            const noData = document.createElement('span');
            noData.textContent = "Estás al día";
            noData.style.color = "rgb(164, 164, 164)"
            loading.remove();
            activitiesDiv.appendChild(noData);

        } else {
            loadingDiv.remove();
            activitiesDiv.classList.add('principal');
            activitiesDiv.style.overflowX = "hidden";
            activitiesDiv.style.overflowY = "auto";
            activitiesDiv.style.minHeight = "73vh";
            activitiesDiv.style.maxHeight = "73vh";

            principalDiv.appendChild(activitiesDiv);

        }

        document.getElementById('numero-tareas')
            .textContent = data.length;

        let coincidence = info.activities.map(act => act?.course_title);

        let coursesName = [...new Set(coincidence)];

        coursesName = coursesName.map((course) => `<option value="${course}" selected>${course}</option>`);

        const selector = `
        <div class="form-group">
            <div class="d-flex flex-row justify-content-start align-items-center"> 
                <label class="mx-2" for="mostrar-con-entrega">Mostrar Con entrega</label>
                <input class="mx-2" type="checkbox" role="switch" id="mostrar-con-entrega" checked>
            </div>
            <label for="filtro-actividades" class="mt-3">Materias seleccionadas</label>
            <select multiple class="form-control" id="filtro-actividades">
                ${coursesName.join("")}
            </select>
        </div>
    `;


        const courseSelector = document.createElement('div');
        courseSelector.id = "filtros-actividades";

        courseSelector.innerHTML = selector;

        activitiesDiv.appendChild(courseSelector);
        const activitiesFilterHTML = document.getElementById('filtro-actividades');
        const wasDeliveredHTML = document.getElementById('mostrar-con-entrega');


        // filter
        const onFilterActivities = (activitiesFilterHTML, wasDeliveredHTML) => {

            const seletedItems = Array.from(activitiesFilterHTML.selectedOptions).map(item => item.value);
            const wasSended = wasDeliveredHTML.checked;
            console.log(wasSended)
            const matchingElements = Array.from(document.querySelectorAll('[id]')).filter(el =>
                el.id.includes('activitydiv')
            );
            matchingElements.forEach(item => {
                const courseData = item.getAttribute('data-course');
                const sendStatus = item.getAttribute('send-status');

                // console.log("curso", courseData)
                // console.log(item);
                console.log("status", sendStatus);

                if (!seletedItems.includes(courseData) || !wasSended && sendStatus == 1) {
                    console.log("id", item.id);
                    item.className = 'CourseList d-none p-3 mb-3 mat-card';
                } else {
                    item.className = 'CourseList d-flex p-3 mb-3 mat-card';
                }

            })
        }

        activitiesFilterHTML.addEventListener('change', () => {
            onFilterActivities(activitiesFilterHTML, wasDeliveredHTML);
        });

        wasDeliveredHTML.addEventListener('change', () => {
            onFilterActivities(activitiesFilterHTML, wasDeliveredHTML);
        });

        data.forEach((activity, index) => {

            // div container each activity
            const activityDiv = document.createElement('div');
            activityDiv.className = "CourseList d-flex p-3 mb-3 mat-card ";
            activityDiv.style.borderRadius = "10px"
            const infoDiv = document.createElement('div')
            infoDiv.className = "d-flex flex-column"
            const dateEstatus = new Date(activity.fechaEstatus); // to str
            const maxDate = new Date(activity?.fechaTermino)
            const maxDateStr = maxDate.toLocaleString(); // to str
            const dateEstatusStr = dateEstatus.toLocaleString(); // to str

            // Create the div content
            const titleActivity = document.createElement('p');
            titleActivity.textContent = activity.titulo
            titleActivity.style.fontWeight = "bold";
            titleActivity.style.fontSize = "1.45rem";
            titleActivity.style.cursor = "pointer";

            const oneDay = 24 * 60 * 60 * 1000;
            let difDays = Math.round(Math.abs((maxDate - new Date()) / oneDay));
            console.log(difDays);

            //alert 
            difDays <= 2 ? titleActivity.classList.add('title-activity-alert') : titleActivity.classList.add('title-activity');

            titleActivity.addEventListener('click', () =>
                onClickActivity(activity?.idCurso, activity?.idActividad));

            infoDiv.innerHTML = `
                <p><strong>Días para que termine:</strong> ${difDays}</p>
                <p><strong>Curso:</strong> ${activity.course_title}</p>
                ${activity.estadoEntrega ?
                    `<p><strong style="margin-right: 10px;">Con entrega</strong><span style="color:green; font-weight: 900;">&#10004;</span></p>`
                    :
                    `<p><strong style="margin-right: 10px;">Sin entrega</strong><span style="color:red; font-weight: 900;">x</span></p>`
                }
                  
                <p><strong>Fecha de Creación:</strong> ${dateEstatusStr}</p>
                <p><strong>Fecha de Máxima:</strong> ${maxDateStr}</p>
                <p><strong>Descripcion:</strong> </p>
                
                ${activity?.descripcion}
                `;

            activityDiv.id = `activitydiv${index}`;
            activityDiv.setAttribute('data-course', activity.course_title);
            activityDiv.setAttribute('send-status', activity.estadoEntrega);
            infoDiv.insertBefore(titleActivity, infoDiv.firstChild);
            activityDiv.appendChild(infoDiv)
            activitiesDiv.appendChild(activityDiv);
        });
    })


}

const forumfilter=(collection,id) =>{
    const selector = `
    <div class="form-group">
        <label for="${id}" class="mt-3">Materias seleccionadas</label>
        <select multiple class="form-control" id="${id}">
            ${collection.join("")}
        </select>
    </div>
`;
    return selector;
} 

const onFilterActivities = (activitiesFilterHTML) => {

    const seletedItems = Array.from(activitiesFilterHTML.selectedOptions).map(item => item.value);
    
    const matchingElements = Array.from(document.querySelectorAll('[id]')).filter(el =>
        el.id.includes('activitydiv')
    );

    matchingElements.forEach(item => {
        const courseData = item.getAttribute('data-course');

        if (!seletedItems.includes(courseData)) {
            console.log("id", item.id);
            item.className = 'CourseList d-none p-3 mb-3 mat-card';
        } else {
            item.className = 'CourseList d-flex p-3 mb-3 mat-card';
        }

    })
}

const forums = (pendingActivities, pendingforums, pendingExams, token, principalDiv) => {
    console.log("hola desde foros");
    if (info.forums == undefined) {
        return;
    }

    pendingActivities.className = "navbar-item border-default border-hover";
    pendingExams.className = "navbar-item border-default border-hover";
    pendingforums.className = "navbar-item border-select";

    const content = document.getElementById('div-contenido');

    content.innerHTML = "";

    allForumsAsync(token).then((data) => {
        if (data.length === 0) {
            const noData = document.createElement('span');
            noData.textContent = "Estás al día";
            noData.style.color = "rgb(164, 164, 164)"
            content.appendChild(noData);

        } else {
            content.classList.add('principal');
            content.style.overflowX = "hidden";
            content.style.overflowY = "auto";
            content.style.minHeight = "73vh";
            content.style.maxHeight = "73vh";
            principalDiv.appendChild(content);

        }

        let coincidence = info.forums.map(act => act?.nombre_curso);

        let coursesName = [...new Set(coincidence)];

        coursesName = coursesName.map((course) => `<option value="${course}" selected>${course}</option>`);

        const selector = forumfilter(coursesName,"filtro-foros");

        const courseSelector = document.createElement('div');
        courseSelector.id = "filtros-actividades";

        courseSelector.innerHTML = selector;

        content.appendChild(courseSelector);
        const activitiesFilterHTML = document.getElementById('filtro-foros');


        activitiesFilterHTML.addEventListener("change",()=>{
            onFilterActivities(activitiesFilterHTML);
        });   

        data.forEach((forum,index) => {
            // div container each activity
            const activityDiv = document.createElement('div');
            activityDiv.className = "CourseList d-flex p-3 mb-3 mat-card ";
            activityDiv.style.borderRadius = "10px"
            const infoDiv = document.createElement('div')
            infoDiv.className = "d-flex flex-column"
            const maxDate = new Date(forum?.fechaTermino)
            const maxDateStr = maxDate.toLocaleString(); // to str

            // Create the div content
            const titleForum = document.createElement('p');
            titleForum.textContent = forum?.titulo
            titleForum.style.fontWeight = "bold";
            titleForum.style.fontSize = "1.45rem";
            titleForum.style.cursor = "pointer";

            titleForum.addEventListener('click', () =>
                onClickForum(forum?.idCurso, forum?.idForo));

            const oneDay = 24 * 60 * 60 * 1000;
            let difDays = Math.round(Math.abs((maxDate - new Date()) / oneDay));
            console.log(difDays);

            //alert 
            difDays <= 2 ? titleForum.classList.add('title-activity-alert') : titleForum.classList.add('title-activity');

            infoDiv.innerHTML = `
                <p><strong>Días para que termine:</strong> ${difDays}</p>
                <p><strong>Curso:</strong> ${forum.nombre_curso}</p>
                
                <p><strong>Fecha de Máxima:</strong> ${maxDateStr}</p>
                <p><strong>Descripcion:</strong> </p>
                
                ${forum?.descripcion}
                `;
            activityDiv.id = `activitydiv${index}`;
            activityDiv.setAttribute("data-course",forum.nombre_curso);
            infoDiv.insertBefore(titleForum, infoDiv.firstChild);
            activityDiv.appendChild(infoDiv)
            content.appendChild(activityDiv);
        });
    })


}

const exams = (pendingActivities, pendingforums, pendingExams, token, principalDiv) => {
    console.log("hola desde examenes");

    if (info.forums == undefined) {
        return;
    }
    pendingActivities.className = "navbar-item border-default border-hover";
    pendingExams.className = "navbar-item border-select";
    pendingforums.className = "navbar-item border-default border-hover";
    const content = document.getElementById('div-contenido');

    content.innerHTML = "";

    allExamsAsync(token).then((data) => {
        if (data.length === 0) {
            const noData = document.createElement('span');
            noData.textContent = "Estás al día";
            noData.style.color = "rgb(164, 164, 164)"
            content.appendChild(noData);

        } else {
            content.classList.add('principal');
            content.style.overflowX = "hidden";
            content.style.overflowY = "auto";
            content.style.minHeight = "73vh";
            content.style.maxHeight = "73vh";
            principalDiv.appendChild(content);

        }

        let coincidence = info.exams.map(act => act?.nombre_curso);

        let coursesName = [...new Set(coincidence)];

        coursesName = coursesName.map((course) => `<option value="${course}" selected>${course}</option>`);

        const selector = forumfilter(coursesName,"filtro-examenes");

        const courseSelector = document.createElement('div');
        courseSelector.id = "filtros-examenes";

        courseSelector.innerHTML = selector;

        content.appendChild(courseSelector);
        const activitiesFilterHTML = document.getElementById('filtro-examenes');

        activitiesFilterHTML.addEventListener("change",()=>{
            onFilterActivities(activitiesFilterHTML);
        });

        data.forEach((exam,index) => {
            // div container each activity
            const activityDiv = document.createElement('div');
            activityDiv.className = "CourseList d-flex p-3 mb-3 mat-card ";
            activityDiv.style.borderRadius = "10px"
            const infoDiv = document.createElement('div')
            infoDiv.className = "d-flex flex-column"
            const maxDate = new Date(exam?.fechaTermino)
            const maxDateStr = maxDate.toLocaleString(); // to str

            // Create the div content
            const titleExam = document.createElement('p');
            titleExam.textContent = exam?.titulo
            titleExam.style.fontWeight = "bold";
            titleExam.style.fontSize = "1.45rem";
            titleExam.style.cursor = "pointer";

            titleExam.addEventListener('click', () =>
                onClickExam(exam?.idCurso, exam?.idExamen));

            const oneDay = 24 * 60 * 60 * 1000;
            let difDays = Math.round(Math.abs((maxDate - new Date()) / oneDay));
            console.log(difDays);

            //alert 
            difDays <= 2 ? titleExam.classList.add('title-activity-alert') : titleExam.classList.add('title-activity');

            infoDiv.innerHTML = `
                <p><strong>Días para que termine:</strong> ${difDays}</p>
                <p><strong>Curso:</strong> ${exam.nombre_curso}</p>
                
                <p><strong>Fecha de Máxima:</strong> ${maxDateStr}</p>
                ${exam.valor ? `<p><strong>Valor:</strong> ${exam.valor}</p>` : ""}
                <p><strong>Total de preguntas:</strong> ${exam.totalPreguntas}</p>
                <p><strong>Duración:</strong> 
                <time datetime="PT${parseInt(exam.tiempo.split(':')[1])}M">${exam.tiempo}</time>
                </p>
                `;

            activityDiv.id = `activitydiv${index}`;
            activityDiv.setAttribute("data-course",exam.nombre_curso);
            infoDiv.insertBefore(titleExam, infoDiv.firstChild);
            activityDiv.appendChild(infoDiv);


            content.appendChild(activityDiv);
        });
    })


}

const activities = (pendingActivities, pendingforums, pendingExams, principalDiv, token) => {
    console.log("hola desde actividades");
    if (info.activities == undefined) {
        return;
    }
    pendingActivities.className = "navbar-item border-select";
    pendingExams.className = "navbar-item border-default border-hover";
    pendingforums.className = "navbar-item border-default border-hover";

    const content = document.getElementById('div-contenido');
    content.innerHTML = "";

    showActivities(token, principalDiv);
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "urlChange" && Object.keys(info).length === 0) {
        const token = localStorage.getItem('accessToken');

        var divs = document.getElementsByClassName('container p-0 ng-star-inserted');
        console.log(divs);

        var favs = divs[0];
        favs.style.display = 'flex';
        // create a new element to show activities
        var principalDiv = document.createElement('div');
        principalDiv.id = "principalId";
        principalDiv.style.maxWidth = '40vh';
        let navbar = document.createElement('nav');
        navbar.style.backgroundColor = "white";
        navbar.className = 'navbar navbar-expand-lg navbar-light bg-light rounded-pill';
        navbar.style.maxWidth = '40vh';
        navbar.style.minWidth = '40vh';

        navbar.innerHTML = htmlNavbar;

        const title = document.createElement('span')
        title.textContent = "Actividades pendientes"
        title.style.fontSize = "1.42857rem";
        title.style.paddingLeft = "8px";
        title.style.fontWeight = "600";
        title.style.marginBottom = "15px"

        principalDiv.appendChild(title);

        principalDiv.appendChild(navbar);

        init(principalDiv, favs);

        allExamsAsync(token)
            .then(exams => {
                document.getElementById('numero-examenes')
                    .textContent = exams.length;
            });

        allForumsAsync(token)
            .then(forums => {
                document.getElementById('numero-foros')
                    .textContent = forums.length;
            });

        let pendingforums = document.getElementById('foros-pendientes');
        let pendingExams = document.getElementById('examenes-pendientes');
        let pendingActivities = document.getElementById('tareas-pendientes');

        pendingforums.addEventListener('click', () => {
            forums(pendingActivities, pendingforums, pendingExams, token, principalDiv);
        });

        pendingExams.addEventListener('click', () => {
            exams(pendingActivities, pendingforums, pendingExams, token, principalDiv);
        });
        pendingActivities.addEventListener('click', () => {
            activities(pendingActivities, pendingforums, pendingExams, principalDiv, token);
        })


        console.log(info);
        console.log("La URL ha cambiado, realizando acción en la página...");


    }
});

