from rest_framework import serializers
from .models import Notebook, Note, Track, Topic, Explanation, JournalEntry
from django.contrib.auth import get_user_model

User = get_user_model()

class NotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notebook
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "notebook",
            "topic",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
    

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        username = validated_data.get('username')
        password = validated_data.get('password')

        user = User.objects.create_user(
            username=username,
            password=password
        )
        return user
    

class TrackSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()
    class Meta: 
        model = Track
        fields = "__all__"
        read_only_fields = ["user", "created_at"]
        
        

class TopicSerializer(serializers.ModelSerializer):
    note_id = serializers.SerializerMethodField()
    track_type = serializers.CharField(source="track.type", read_only=True)
    track_title = serializers.CharField(source="track.title", read_only=True)

    class Meta:
        model = Topic
        fields = "__all__"
        read_only_fields = ["track", "created_at"]

    def get_note_id(self, obj):
        if hasattr(obj, "note"):
            return obj.note.id
        return None
    
    def validate(self, data):
        # Determine track
        if self.instance:
            track = self.instance.track
        else:
            track = data.get("track")

        if not track:
            return data

        # Determine final repeat type after update
        repeat_type = data.get("repeat_type", None)

        if self.instance:
            final_repeat_type = repeat_type if repeat_type is not None else self.instance.repeat_type
        else:
            final_repeat_type = repeat_type

        # Restrict repeat to personal tracks
        if final_repeat_type and final_repeat_type != "none" and track.type != "personal":
            raise serializers.ValidationError(
                "Repeat is allowed only in Personal tracks."
            )

        # Weekly validation (supports partial updates)
        if final_repeat_type == "weekly":
            weekly_target = data.get(
                "weekly_target",
                self.instance.weekly_target if self.instance else None
            )

            if not weekly_target or weekly_target < 1 or weekly_target > 7:
                raise serializers.ValidationError(
                    "Weekly repeat requires a target between 1 and 7."
                )

        return data
    
    
        
class FeynmanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Explanation
        fields = ["id", "content", "clarity_score", "created_at"]
        read_only_fields = ["clarity_score", "created_at"]
        
class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = "__all__"
        read_only_fields = ["user"]
        
        
class ProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.username")

    class Meta:
        model = User
        fields = ["name", "bio", "avatar", "created_at"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        # update username
        if "username" in user_data:
            instance.user.username = user_data["username"]
            instance.user.save()

        # update profile fields
        instance.bio = validated_data.get("bio", instance.bio)
        instance.avatar = validated_data.get("avatar", instance.avatar)

        instance.save()
        return instance