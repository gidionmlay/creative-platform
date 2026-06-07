/**
 * Course Player & Detail Logic
 */
$(document).ready(function() {

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    let courseData = null;
    let allLessons = [];
    let currentLesson = null;
    let videoElement = null;

    if (!courseId) {
        window.location.href = 'index.html';
        return;
    }

    const init = async () => {
        const res = await window.coursesApi.getCourseDetail(courseId);
        if (!res || !res.ok) {
            if (window.showToast) window.showToast('error', 'Failed to load course details. You may not have access.');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }

        courseData = res.data;
        
        // Flatten lessons for easy next/prev navigation
        courseData.modules.forEach(m => {
            if (m.lessons) {
                allLessons = allLessons.concat(m.lessons);
            }
        });

        renderCourseInfo();
        renderPlaylist();
        
        // Determine first lesson to play (first uncompleted, or just first)
        let lessonToPlay = allLessons.find(l => !l.is_completed);
        if (!lessonToPlay && allLessons.length > 0) lessonToPlay = allLessons[0];
        
        if (lessonToPlay) {
            loadLesson(lessonToPlay);
        } else {
            $('#videoContainer').html('<div style="display:flex; height:100%; align-items:center; justify-content:center; color:white;">No lessons available.</div>');
        }
    };

    const renderCourseInfo = () => {
        $('#pageCourseTitle').text(courseData.title);
        $('#courseDescription').text(courseData.description);
        
        if (courseData.is_enrolled) {
            $('#overallProgressText').text(`${courseData.progress}%`);
            $('#overallProgressFill').css('width', `${courseData.progress}%`);
        } else {
            $('#overallProgressText').text('Preview Mode');
        }
    };

    const renderPlaylist = () => {
        const accordion = $('#moduleAccordion');
        let html = '';

        if (!courseData.modules || courseData.modules.length === 0) {
            accordion.html('<p style="text-align: center; color: var(--admin-text-muted);">No content available.</p>');
            return;
        }

        courseData.modules.forEach((module, mIndex) => {
            let lessonsHtml = `<div class="module-lessons" id="module-${mIndex}" style="display: block; margin-bottom: 15px;">`;
            
            module.lessons.forEach(lesson => {
                const isLocked = !courseData.is_enrolled && !lesson.is_preview;
                const iconClass = lesson.is_completed ? 'fa-check-circle' : (isLocked ? 'fa-lock' : 'fa-play-circle');
                const colorClass = lesson.is_completed ? 'color: var(--status-success);' : (isLocked ? 'color: var(--admin-text-muted);' : 'color: var(--admin-text);');
                const lockClass = isLocked ? 'locked' : '';
                const previewBadge = lesson.is_preview && !courseData.is_enrolled ? '<span style="font-size:10px; background:var(--admin-accent); color:white; padding:2px 6px; border-radius:4px; margin-left:8px;">Preview</span>' : '';

                lessonsHtml += `
                    <div class="lesson-item ${lockClass}" data-id="${lesson.id}" id="lesson-item-${lesson.id}">
                        <div class="lesson-icon" style="${colorClass}">
                            <i class="fal ${iconClass}"></i>
                        </div>
                        <div class="lesson-title">
                            ${lesson.title} ${previewBadge}
                        </div>
                        <div class="lesson-duration">${lesson.duration || ''}</div>
                    </div>
                `;
            });
            
            lessonsHtml += `</div>`;

            html += `
                <div class="module-section">
                    <div class="module-header" onclick="$('#module-${mIndex}').slideToggle(200);">
                        <span>Module ${mIndex + 1}: ${module.title}</span>
                        <i class="fal fa-chevron-down" style="font-size: 12px;"></i>
                    </div>
                    ${lessonsHtml}
                </div>
            `;
        });

        accordion.html(html);

        // Bind clicks
        $('.lesson-item').on('click', function() {
            if ($(this).hasClass('locked')) {
                if (window.showToast) window.showToast('info', 'Please enroll in the course to unlock this lesson.');
                return;
            }
            const lid = $(this).data('id');
            const lesson = allLessons.find(l => l.id == lid);
            if (lesson) loadLesson(lesson);
        });
    };

    const loadLesson = (lesson) => {
        currentLesson = lesson;
        
        // Update Active State
        $('.lesson-item').removeClass('active');
        $(`#lesson-item-${lesson.id}`).addClass('active');

        // Update Info
        $('#currentLessonTitle').text(lesson.title);
        
        // Load Video
        if (lesson.video_url) {
            $('#videoContainer').html(`
                <video controls id="courseVideoPlayer" style="width: 100%; height: 100%;" autoplay>
                    <source src="${lesson.video_url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `);

            videoElement = document.getElementById('courseVideoPlayer');
            
            videoElement.addEventListener('ended', async () => {
                await handleLessonComplete(lesson);
                playNextLesson();
            });

        } else {
            $('#videoContainer').html('<div style="display:flex; height:100%; align-items:center; justify-content:center; color:white; flex-direction:column;"><i class="fal fa-lock mb-2" style="font-size:32px;"></i><span>Video Locked</span></div>');
        }

        // Setup manual complete button
        const completeBtn = $('#markCompleteBtn');
        if (courseData.is_enrolled && !lesson.is_completed) {
            completeBtn.show();
            completeBtn.off('click').on('click', async function() {
                const btn = $(this);
                btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin mr-2"></i> Marking...');
                await handleLessonComplete(lesson);
                btn.hide();
                playNextLesson();
            });
        } else {
            completeBtn.hide();
        }
    };

    const handleLessonComplete = async (lesson) => {
        if (!courseData.is_enrolled || lesson.is_completed) return;
        
        const res = await window.coursesApi.markLessonComplete(lesson.id);
        if (res && res.ok) {
            lesson.is_completed = true;
            
            // Update UI
            const iconWrap = $(`#lesson-item-${lesson.id} .lesson-icon`);
            iconWrap.css('color', 'var(--status-success)');
            iconWrap.html('<i class="fal fa-check-circle"></i>');

            // Update progress
            $('#overallProgressText').text(`${res.data.progress}%`);
            $('#overallProgressFill').css('width', `${res.data.progress}%`);
            
            if (window.showToast) window.showToast('success', 'Lesson marked as complete!');
        }
    };

    const playNextLesson = () => {
        if (!currentLesson) return;
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        
        if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            if (!nextLesson.video_url && !nextLesson.is_preview && !courseData.is_enrolled) {
                // Next is locked
                return;
            }
            loadLesson(nextLesson);
        }
    };

    // Start
    init();
});
