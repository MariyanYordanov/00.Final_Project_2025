function copyShareUrl() {
            const urlInput = document.getElementById('shareUrl');
            urlInput.select();
            urlInput.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(urlInput.value);
            showToast('Share URL copied to clipboard!', 'success');
        }

        function shareOnFacebook() {
            const url = document.getElementById('shareUrl').value;
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(facebookUrl, '_blank', 'width=600,height=400');
        }

        function shareOnTwitter() {
            const url = document.getElementById('shareUrl').value;
            const text = `Check out the @Model.Name family tree on World Family!`;
            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
        }

        function shareViaEmail() {
            const url = document.getElementById('shareUrl').value;
            const subject = `Check out the @Model.Name family tree`;
            const body = `I wanted to share this amazing family tree with you: ${url}`;
            const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = emailUrl;
        }

        function inviteMembers(familyId) {
            // Implementation for inviting members
            alert('Invite members functionality - to be implemented');
        }